const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = ts.transpileModule(readFileSync('src/api/midtrans.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;

function setup({ ready = true, postError } = {}) {
  const scripts = [];
  const calls = [];
  const payments = [];
  const snap = { pay: (token, callbacks) => payments.push({ token, callbacks }) };
  const window = { setTimeout, clearTimeout, ...(ready ? { snap } : {}) };
  const exports = {};
  vm.runInNewContext(source, {
    exports, window,
    document: {
      createElement: () => ({ setAttribute() {}, remove() { this.removed = true; } }),
      body: { appendChild: (script) => scripts.push(script) }
    },
    require: () => ({ api: { post: async (url) => {
      calls.push(url);
      if (postError) throw postError;
      return { data: { data: { token: 'snap-token', clientKey: 'client-test' } } };
    } } })
  });
  return { pay: exports.payWithMidtrans, scripts, payments, calls, window, snap };
}

const tick = () => new Promise(resolve => setImmediate(resolve));

test('uses the existing invoice endpoint and waits for Snap callbacks', async () => {
  for (const [callback, result] of [['onSuccess', 'success'], ['onPending', 'pending'], ['onClose', 'closed']]) {
    const app = setup();
    let settled = false;
    const payment = app.pay('invoice-123').then(value => { settled = true; return value; });
    await tick();
    assert.equal(settled, false);
    assert.equal(app.calls[0], '/public/invoices/invoice-123/midtrans');
    assert.equal(app.payments[0].token, 'snap-token');
    app.payments[0].callbacks[callback]();
    assert.equal(await payment, result);
  }
});

test('surfaces API and Snap failures', async () => {
  const apiFailure = setup({ postError: new Error('API unavailable') });
  await assert.rejects(apiFailure.pay('invoice'), /API unavailable/);
  assert.equal(apiFailure.payments.length, 0);
  const app = setup();
  const payment = app.pay('invoice');
  await tick();
  app.payments[0].callbacks.onError();
  await assert.rejects(payment, /gagal diproses/);
});

test('waits for a shared script load instead of opening Snap early', async () => {
  const app = setup({ ready: false });
  const first = app.pay('invoice-1');
  const second = app.pay('invoice-2');
  await tick();
  assert.equal(app.scripts.length, 1);
  assert.equal(app.payments.length, 0);
  app.window.snap = app.snap;
  app.scripts[0].onload();
  await tick();
  assert.equal(app.payments.length, 2);
  app.payments.forEach(payment => payment.callbacks.onClose());
  await Promise.all([first, second]);
});

test('removes a failed script and allows retry', async () => {
  const app = setup({ ready: false });
  const first = app.pay('invoice');
  await tick();
  app.scripts[0].onerror();
  await assert.rejects(first, /gagal dimuat/);
  assert.equal(app.scripts[0].removed, true);
  const retry = app.pay('invoice');
  await tick();
  assert.equal(app.scripts.length, 2);
  app.window.snap = app.snap;
  app.scripts[1].onload();
  await tick();
  app.payments[0].callbacks.onClose();
  assert.equal(await retry, 'closed');
});
