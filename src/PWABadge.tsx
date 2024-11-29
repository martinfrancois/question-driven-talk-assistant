import { useRegisterSW } from "virtual:pwa-register/react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  );
}

function PWABadge() {
  // periodic sync is disabled, change the value to enable it, the period is in milliseconds
  // You can remove onRegisteredSW callback and registerPeriodicSync function
  const period = 0;

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return;
      if (r?.active?.state === "activated") {
        registerPeriodicSync(period, swUrl, r);
      } else if (r?.installing) {
        r.installing.addEventListener("statechange", (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === "activated") registerPeriodicSync(period, swUrl, r);
        });
      }
    },
  });

  function close() {
    setNeedRefresh(false);
  }

  return (
    <div
      role="alert"
      aria-labelledby="toast-message"
      className="fixed bottom-4 right-4 z-50"
    >
      {needRefresh && (
        <Alert className="flex items-center justify-between border-neutral-300 bg-black p-4 text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
          <div className="flex items-center space-x-4 pr-6">
            <InfoIcon />
            <div>
              <AlertTitle className="text-sm font-bold">
                New version available
              </AlertTitle>
              <AlertDescription>Click reload to update.</AlertDescription>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="confirmSafe"
              onClick={() => void updateServiceWorker(true)}
            >
              Reload
            </Button>
            <Button
              onClick={close}
              className="border-neutral-500 bg-neutral-200 text-neutral-900 hover:bg-white"
            >
              Close
            </Button>
          </div>
        </Alert>
      )}
    </div>
  );
}

export default PWABadge;

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration,
) {
  if (period <= 0) return;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setInterval(async () => {
    if ("onLine" in navigator && !navigator.onLine) return;

    const resp = await fetch(swUrl, {
      cache: "no-store",
      headers: {
        cache: "no-store",
        "cache-control": "no-cache",
      },
    });

    if (resp?.status === 200) await r.update();
  }, period);
}
