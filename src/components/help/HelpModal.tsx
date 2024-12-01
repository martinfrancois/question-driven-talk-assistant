import React, { useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRegisterSW } from "virtual:pwa-register/react";
import { SelectableTextFocusLock } from "../ui/SelectableTextFocusLock.tsx";
import { About } from "./About";
import { useRestartTour } from "../../stores";
import { useDarkModeClassName } from "../hooks/dark-mode-classnames.ts";

function Kbd(props: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-neutral-200 px-1.5 py-0.5 dark:bg-neutral-700">
      {props.children}
    </kbd>
  );
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const restartTour = useRestartTour();

  const darkModeClassName = useDarkModeClassName();

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onNeedRefresh() {
      setNeedRefresh(true);
    },
  });

  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  const handleUpdate = useCallback(() => {
    void updateServiceWorker(true);
    setNeedRefresh(false);
  }, [setNeedRefresh, updateServiceWorker]);

  const onRestartTourAndClose = useCallback(() => {
    restartTour();
    onClose();
  }, [restartTour, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        data-testid="help-modal"
        className={`${darkModeClassName} max-w-6xl bg-white text-neutral-950 dark:bg-neutral-800 dark:text-neutral-50`}
      >
        <SelectableTextFocusLock>
          <DialogHeader>
            <DialogTitle className="pl-4 text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
              Help
            </DialogTitle>
            <DialogDescription className="sr-only">
              Help dialog containing information about shortcuts, features,{" "}
              {needRefresh ? "a button to upgrade to the latest version, " : ""}
              and a button to restart the guided tour.
            </DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[70vh] overflow-y-auto pb-0 pt-0">
            <div className="flex flex-1 flex-col pr-2">
              <div className="modal scrollbar-minimal overflow-y-auto p-2">
                <div className="font-normal" tabIndex={0}>
                  <table className="w-full text-left">
                    <caption className="sr-only">
                      Keyboard Shortcuts and Descriptions
                    </caption>
                    <thead className="text-neutral-950 dark:text-neutral-50">
                      <tr>
                        <th
                          scope="col"
                          className="border-b px-2 py-2 font-semibold"
                        >
                          Shortcut
                        </th>
                        <th
                          scope="col"
                          className="border-b px-2 py-2 font-semibold"
                        >
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <Features />
                      <ManagingQuestions />
                      <ReorderingQuestions />
                      <Navigation />
                      <HighlightingAndAnswering />
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Sidebar on the bottom for smaller screens */}
              <aside className="border-t pl-4 pr-4 pt-4 lg:hidden">
                <About
                  newVersionAvailable={needRefresh}
                  updateVersion={handleUpdate}
                  onRestartTour={onRestartTourAndClose}
                />
              </aside>
            </div>
            {/* Sidebar on the right for larger screens */}
            <aside className="w-65 hidden flex-shrink-0 flex-col border-l pl-4 lg:flex">
              <div className="flex h-full flex-col justify-between">
                <About
                  newVersionAvailable={needRefresh}
                  updateVersion={handleUpdate}
                  onRestartTour={onRestartTourAndClose}
                />
              </div>
            </aside>
          </div>
        </SelectableTextFocusLock>
      </DialogContent>
    </Dialog>
  );
};

function TableHeader(props: { children: React.ReactNode }) {
  return (
    <tr className="bg-neutral-100 dark:bg-neutral-800">
      <th
        colSpan={2}
        className="text-md border-b px-2 py-2 font-semibold text-neutral-950 dark:text-neutral-50"
      >
        {props.children}
      </th>
    </tr>
  );
}

function TableCell(props: { children: React.ReactNode }) {
  return (
    <td className="border-b px-2 py-2 text-neutral-950 dark:text-neutral-50">
      {props.children}
    </td>
  );
}

function Features() {
  return (
    <>
      <TableHeader>Features</TableHeader>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>P</Kbd>
        </TableCell>
        <TableCell>
          Increase font size{" "}
          <span className="text-sm text-neutral-500">(P for Plus)</span>
        </TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>M</Kbd>
        </TableCell>
        <TableCell>
          Decrease font size{" "}
          <span className="text-sm text-neutral-500">(M for Minus)</span>
        </TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>D</Kbd>
        </TableCell>
        <TableCell>Toggle dark mode</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>Q</Kbd>
        </TableCell>
        <TableCell>Show a large QR code on the screen</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>F</Kbd>
        </TableCell>
        <TableCell>Enter full-screen mode</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd>
        </TableCell>
        <TableCell>Save questions to a Markdown file</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>H</Kbd>
        </TableCell>
        <TableCell>Show help (this pop-up window)</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>T</Kbd>
        </TableCell>
        <TableCell>Edit title text</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>F</Kbd>
        </TableCell>
        <TableCell>Edit footer text</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>Q</Kbd>
        </TableCell>
        <TableCell>Edit QR code URL</TableCell>
      </tr>
    </>
  );
}

function ManagingQuestions() {
  return (
    <>
      <TableHeader>Managing Questions</TableHeader>
      <tr>
        <TableCell>
          <Kbd>Enter</Kbd>
        </TableCell>
        <TableCell>Add a new question below the current one</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd>
        </TableCell>
        <TableCell>Add a new line within a question</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd>
        </TableCell>
        <TableCell>
          Clicks the checkbox of the currently focused question text
        </TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Backspace</Kbd>
        </TableCell>
        <TableCell>Delete the current question (if empty)</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>Backspace</Kbd>
        </TableCell>
        <TableCell>Clear all questions (with confirmation)</TableCell>
      </tr>
    </>
  );
}

function ReorderingQuestions() {
  return (
    <>
      <TableHeader>Reordering Questions</TableHeader>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>Up</Kbd>
        </TableCell>
        <TableCell>Move the current question up</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>Down</Kbd>
        </TableCell>
        <TableCell>Move the current question down</TableCell>
      </tr>
    </>
  );
}

function Navigation() {
  return (
    <>
      <TableHeader>Navigation</TableHeader>
      <tr>
        <TableCell>
          <Kbd>Tab</Kbd>
        </TableCell>
        <TableCell>Move to the next question</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Shift</Kbd> + <Kbd>Tab</Kbd>
        </TableCell>
        <TableCell>Move to the previous question</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Arrow Up</Kbd>
        </TableCell>
        <TableCell>Move cursor up or to the previous question</TableCell>
      </tr>
      <tr>
        <TableCell>
          <Kbd>Arrow Down</Kbd>
        </TableCell>
        <TableCell>Move cursor down or to the next question</TableCell>
      </tr>
    </>
  );
}

function HighlightingAndAnswering() {
  return (
    <>
      <TableHeader>Highlighting & Answering</TableHeader>
      <tr>
        <TableCell>Click checkbox once</TableCell>
        <TableCell>Highlight the question you are answering</TableCell>
      </tr>
      <tr>
        <TableCell>Click highlighted checkbox</TableCell>
        <TableCell>Mark question as answered</TableCell>
      </tr>
      <tr>
        <TableCell>Click answered checkbox</TableCell>
        <TableCell>Unmark as answered</TableCell>
      </tr>
    </>
  );
}
