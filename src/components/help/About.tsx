import { ExternalLink } from "../ui/ExternalLink.tsx";
import { Button } from "@/components/ui/button.tsx";

export function About(props: {
  newVersionAvailable: boolean;
  updateVersion: () => void;
  onRestartTour: () => void;
}) {
  return (
    <div className="font-normal dark:text-neutral-50">
      <p className="text-sm">
        Made with <span className="text-lg text-red-500">❤️</span> by{" "}
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
        <div className={"mt-4"}>
          <p className="mt-4 mb-1 pr-2 text-sm font-medium">
            New version available:
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={props.updateVersion}
            className="border-green-400 bg-green-900 text-neutral-50 hover:bg-green-800"
          >
            Update to the latest version
          </Button>
        </div>
      )}
      <Button
        size="sm"
        onClick={props.onRestartTour}
        className="mt-6"
        data-testid="restart-tour"
        variant="outline"
      >
        Restart Guided Tour
      </Button>
    </div>
  );
}
