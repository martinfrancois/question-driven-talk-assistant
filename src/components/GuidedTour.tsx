import { useCallback } from "react";
import Joyride, { CallBackProps } from "react-joyride";
import { steps } from "./guided-tour-steps.ts";

interface GuidedTourProps {
  isTourCompleted: boolean;
  onTourCompleted: () => void;
}

const GuidedTour = ({ isTourCompleted, onTourCompleted }: GuidedTourProps) => {
  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status } = data;
      const finishedStatuses = ["finished", "skipped"];
      if (finishedStatuses.includes(status)) {
        onTourCompleted();
      }
    },
    [onTourCompleted],
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
