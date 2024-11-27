import { ExternalLink } from "../ExternalLink.tsx";
import { Button } from "@material-tailwind/react";

export function About(props: {
  newVersionAvailable: boolean;
  updateVersion: () => void;
  onRestartTour: () => void;
}) {
  return (
    <div className="text-gray-950 font-normal dark:text-gray-50">
      <p className="text-sm">
        Made with ❤️ by{" "}
        <ExternalLink href="https://www.fmartin.ch">
          François Martin
        </ExternalLink>
      </p>
      <p className="mt-2 text-sm">
        This project is open source on{" "}
        <ExternalLink href="https://github.com/martinfrancois/question-driven-talk-assistant">
          GitHub
        </ExternalLink>
      </p>
      {props.newVersionAvailable && (
        <>
          <p className="mt-4 text-sm font-medium">New version available:</p>
          <Button
            color="blue"
            size="sm"
            onClick={props.updateVersion}
            className="mt-2 text-white"
          >
            Update to the latest version
          </Button>
        </>
      )}
      <Button
        color="blue-gray"
        size="sm"
        onClick={props.onRestartTour}
        className="mt-6 text-white"
        data-testid="restart-tour"
      >
        Restart Guided Tour
      </Button>
    </div>
  );
}
