import TimeDisplay from "./TimeDisplay.tsx";

export function Header(props: {
  onClick: () => void;
  title: string;
  format24h: boolean;
  toggleFormat: () => void;
}) {
  return (
    <div className="flex flex-shrink-0 items-center">
      <div className="flex-grow">
        <div
          onClick={props.onClick}
          className="cursor-pointer text-3xl font-semibold"
          data-testid="main-header"
        >
          {props.title}
        </div>
      </div>
      <div className="pr-2 text-right">
        <TimeDisplay
          format24h={props.format24h}
          toggleFormat={props.toggleFormat}
        />
      </div>
    </div>
  );
}
