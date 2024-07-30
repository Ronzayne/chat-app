import { Laugh, Mic, Plus, Send } from "lucide-react";
import { Input } from "../ui/input"; //from shadcn
import { useState } from "react";
import { Button } from "../ui/button"; //from shadcn

const MessageInput = () => {
  const [msgText, setMsgText] = useState("");

  return (
    <div className="bg-gray-primary p-2 flex gap-4 items-center">
      <div className="relative flex gap-2 ml-2">
        {/* EMOJI PICKER WILL GO HERE */}
        <Laugh className="text-gray-600 dark:text-gray-400" />
        <Plus className="text-gray-600 dark:text-gray-400" />
      </div>

      <form className="w-full flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Type a message"
            className="py-2 text-sm w-full rounded-lg shadow-sm bg-gray-tertiary focus-visible:ring-transparent"
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
          />
        </div>
        <div className="mr-4 flex items-center gap-3">
          {msgText.length > 0 ? ( //if the message length is greater than zero or not empty, the button will be a send or submit button else the button will be the mic button
            <Button
              type="submit"
              size={"sm"}
              className="bg-transparent text-foreground hover:bg-transparent"
            >
              <Send />
            </Button>
          ) : (
            <Button
              type="submit"
              size={"sm"}
              className="bg-transparent text-foreground hover:bg-transparent"
            >
              <Mic />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
export default MessageInput;
