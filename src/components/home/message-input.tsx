import { Laugh, Send } from "lucide-react";
import { Input } from "../ui/input"; //from shadcn
import { useState } from "react";
import { Button } from "../ui/button"; //from shadcn
import { api } from "../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useConversationStore } from "@/chats/chats-store";
import toast from "react-hot-toast";
import EmojiPicker, { Theme } from "emoji-picker-react";
import useComponentVisible from "@/hooks/useComponentVisible";
import MediaDropdown from "./media-dropdown";

const MessageInput = () => {
  const [msgText, setMsgText] = useState("");
  const sendTextMsg = useMutation(api.messages.sendTextMessage);
  const me = useQuery(api.users.getMe);
  const { selectedConversation } = useConversationStore();

  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  const handleSendTextMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendTextMsg({
        content: msgText,
        conversation: selectedConversation!._id,
        sender: me!._id,
      });
      setMsgText("");
    } catch (err: any) {
      toast.error(err.message);
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && msgText.trim()) {
      handleSendTextMsg(e as any);
    } else if (e.key === "Enter") {
      e.preventDefault(); //if the message is empty, pressing enter will not send anything.
    }
  };

  return (
    <div className="bg-gray-primary p-2 flex gap-4 items-center">
      <div className="relative flex gap-2 ml-2">
        {/* EMOJI PICKER WILL GO HERE */}
        <div ref={ref} onClick={() => setIsComponentVisible(true)}>
          {isComponentVisible && (
            <EmojiPicker
              theme={Theme.DARK}
              onEmojiClick={(emojiObject) => {
                setMsgText((prev) => prev + emojiObject.emoji);
              }}
              style={{
                position: "absolute",
                bottom: "1.5rem",
                left: "1em",
                zIndex: 50,
              }}
            />
          )}
          <Laugh className="text-gray-600 dark:text-gray-400" />
        </div>

        <MediaDropdown />
      </div>

      <form onSubmit={handleSendTextMsg} className="w-full flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Type a message"
            className="py-2 text-sm w-full rounded-lg shadow-sm bg-gray-tertiary focus-visible:ring-transparent"
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="mr-4 flex items-center gap-3">
          {msgText.trim() && ( //The send button will only show when the user starts typing
            <Button
              type="submit"
              size={"sm"}
              className="bg-transparent text-foreground hover:bg-transparent"
            >
              <Send />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
export default MessageInput;
