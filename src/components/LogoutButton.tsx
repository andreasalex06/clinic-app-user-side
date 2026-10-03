import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import { Button } from "./ui/button";

export function LogoutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const navigate = useNavigate();
  const logout = usePatientAuthStore((state) => state.logout);

  function confirmLogout() {
    dialog.current?.close();
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size={iconOnly ? "icon" : "default"}
        className={iconOnly ? "size-9 shrink-0" : "w-full justify-center sm:w-auto"}
        aria-label="Keluar akun"
        aria-haspopup="dialog"
        title="Keluar akun"
        onClick={() => dialog.current?.showModal()}
      >
        <LuLogOut aria-hidden="true" className="size-4" />
        {!iconOnly && "Keluar Akun"}
      </Button>
      {createPortal(
        <dialog
          ref={dialog}
          aria-labelledby={id + "-title"}
          aria-describedby={id + "-description"}
          className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%_-_2rem)] max-w-sm overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 text-slate-950 shadow-xl backdrop:bg-black/40"
        >
          <h2 id={id + "-title"} className="text-lg font-semibold">Keluar akun?</h2>
          <p id={id + "-description"} className="mt-2 text-sm leading-6 text-slate-600">Apakah Anda ingin keluar dari akun?</p>
          <div className="mt-5 flex justify-end gap-2">
            <Button autoFocus type="button" variant="outline" onClick={() => dialog.current?.close()}>Batal</Button>
            <Button type="button" variant="destructive" onClick={confirmLogout}>Keluar</Button>
          </div>
        </dialog>,
        document.body
      )}
    </>
  );
}
