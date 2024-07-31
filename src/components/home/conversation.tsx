import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSeenSvg } from "@/lib/svgs";
import { ImageIcon, Users, VideoIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/chats/chats-store";

const Conversation = ({ conversation }: { conversation: any }) => {
  const conversationImage = conversation.groupImage || conversation.image; // Meaning either conversation will have a group image or the conversation will have an image (this is the users image)
  const conversationName = conversation.groupName || conversation.name; //Meaning either conversation will have a group name or the name of the user
  const lastMessage = conversation.lastMessage;
  const lastMessageType = lastMessage?.messageType;
  const me = useQuery(api.users.getMe);

  const { setSelectedConversation, selectedConversation } =
    useConversationStore();
  const activeBgClass = selectedConversation?._id === conversation._id;
  return (
    <>
      <div
        className={`flex gap-2 items-center p-3 hover:bg-chat-hover cursor-pointer 
        ${activeBgClass ? "bg-gray-tertiary" : ""}
        `}
        onClick={() => setSelectedConversation(conversation)}
      >
        <Avatar className="border border-gray-900 overflow-visible relative">
          {conversation.isOnline && (
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground" />
          )}
          <AvatarImage
            src={conversationImage || "/placeholder.png"}
            className="object-cover rounded-full"
          />
          <AvatarFallback>
            <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full"></div>
          </AvatarFallback>
        </Avatar>
        <div className="w-full">
          <div className="flex items-center">
            <h3 className="text-xs lg:text-sm font-medium">
              {conversationName}
            </h3>
            <span className="text-[10px] lg:text-xs text-gray-500 ml-auto">
              {formatDate(
                lastMessage?._creationTime || conversation._creationTime
              )}
            </span>
          </div>
          <p className="text-[12px] mt-1 text-gray-500 flex items-center gap-1 ">
            {lastMessage?.sender === me?._id ? <MessageSeenSvg /> : ""}
            {conversation.isGroup && <Users size={16} />}
            {!lastMessage && "Say Hi!"}
            {lastMessageType === "text" ? (
              lastMessage?.content.length > 30 ? (
                <span className="text-xs">
                  {lastMessage?.content.slice(0, 30)}...
                </span> //So if it's not the last message, it should say hi. if it's the last message and the type is Text and the content is greater than 30, it should just cut to the first 30 and represent the rest with three dots
              ) : (
                <span className="text-xs">{lastMessage?.content}</span> //if its less than the 30 characters, then the message is shown as it is . Else it should be null if the type is not text
              )
            ) : null}
            {
              lastMessageType === "image" && <ImageIcon size={16} /> // so here it's just the image icon that will be shown and nothing else(null) because it's type is not "text"
            }
            {lastMessageType === "video" && <VideoIcon size={16} />}
          </p>
        </div>
      </div>
      <hr className="h-[1px] mx-10 bg-gray-primary" />
    </>
  );
};
export default Conversation;
