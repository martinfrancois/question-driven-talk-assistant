export function Footer(props: { onClick: () => void, footer: string }) {
    return <div
        onClick={props.onClick}
        className="flex-shrink-0 cursor-pointer p-2 text-center text-xl"
        data-testid="main-footer"
    >
        {props.footer}
    </div>;
}