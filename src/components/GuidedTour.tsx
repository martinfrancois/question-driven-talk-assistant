import { useCallback } from "react";
import Joyride, { CallBackProps } from "react-joyride";
import { steps } from "./guided-tour-steps.ts";
import { useCompleteTour, useTourCompleted } from "../stores";

const GuidedTour = () => {
  const isTourCompleted = useTourCompleted();
  const completeTour = useCompleteTour();

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status } = data;
      const finishedStatuses = ["finished", "skipped"];
      if (finishedStatuses.includes(status)) {
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
      showSkipButton
      disableOverlayClose
      disableCloseOnEsc
      spotlightClicks
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#00aaff",
          zIndex: 10000,
        },
        buttonClose: { display: "none" },
      }}
    />
  );
};

export default GuidedTour;
