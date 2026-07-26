import { useCompleteTour, useTourCompleted } from "@/stores";
import { useCallback } from "react";
import { Joyride, type EventData } from "react-joyride";
import { steps } from "./guided-tour-steps.ts";

const GuidedTour = () => {
  const isTourCompleted = useTourCompleted();
  const completeTour = useCompleteTour();

  const handleJoyrideEvent = useCallback(
    (data: EventData) => {
      const { status } = data;
      if (status === "finished" || status === "skipped") {
        completeTour();
      }
    },
    [completeTour],
  );

  return (
    <Joyride
      steps={steps}
      run={!isTourCompleted}
      continuous
      onEvent={handleJoyrideEvent}
      options={{
        blockTargetInteraction: false,
        buttons: ["back", "close", "primary", "skip"],
        dismissKeyAction: false,
        overlayClickAction: false,
        primaryColor: "#00aaff",
        zIndex: 10000,
      }}
      styles={{
        buttonClose: { display: "none" },
      }}
    />
  );
};

export default GuidedTour;
