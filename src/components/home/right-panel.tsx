"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, X } from "lucide-react";
import MessageInput from "./message-input";
import MessageContainer from "./message-container";
import ChatPlaceHolder from "@/components/home/chat-placeholder";
import GroupMembersDialog from "./group-members-dialog";
import { useConversationStore } from "@/chats/chats-store";
import { useConvexAuth } from "convex/react";

const RightPanel = () => {
  const { selectedConversation, setSelectedConversation } =
    useConversationStore(); // if there is no conversation or it is null, it should return the place holder else it will return the conversation. {message container}
  const { isLoading } = useConvexAuth();
  if (isLoading) return null;
  if (!selectedConversation) return <ChatPlaceHolder />;

  const conversationName =
    selectedConversation.groupName || selectedConversation.name; // the selected conversation should either be the group name or the selected user's name
  const conversationImage =
    selectedConversation.groupImage || selectedConversation.image; // the selected conversation should either show the group image or the selected user's image
  return (
    <div className="w-3/4 flex flex-col">
      <div className="w-full sticky top-0 z-50">
        {/* Header */}
        <div className="flex justify-between bg-gray-primary p-3">
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage
                src={conversationImage || "/placeholder.png"}
                className="object-cover" //The avatar image should show the conversation image(either group or user) or the no image placeholder if there is no image
              />
              <AvatarFallback>
                <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p>{conversationName}</p>
              {
                selectedConversation.isGroup && (
                  <GroupMembersDialog
                    selectedConversation={selectedConversation}
                  />
                ) // if the selected conversation is a group then it should show the group members
              }
            </div>
          </div>

          <div className="flex items-center gap-7 mr-5">
            <a href="/video-call" target="_blank">
              <Video size={23} />
            </a>
            <X
              size={16}
              className="cursor-pointer"
              onClick={() => setSelectedConversation(null)}
            />
          </div>
        </div>
      </div>
      {/* CHAT MESSAGES */}
      <MessageContainer />

      {/* INPUT */}
      <MessageInput />
    </div>
  );
};
export default RightPanel;
