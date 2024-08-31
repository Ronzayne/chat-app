import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ImageIcon, MessageSquareDiff } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import toast from "react-hot-toast";
import { useConversationStore } from "@/chats/chats-store";

type User = {
  _id: Id<"users">;
  _creationTime: number;
  name?: string;
  email: string;
  image: string;
  tokenIdentifier: string;
  isOnline: boolean;
};
const UserListDialog = () => {
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [renderedImage, setRenderedImage] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); //state to track search Input
  const [filteredUsers, setFilteredUsers] = useState<User[] | null>(null);
  const [errorMessage, setErrorMessage] = useState(""); // state for error message
  const imgRef = useRef<HTMLInputElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const createConversation = useMutation(api.conversations.createConversation);
  const generateUploadUrl = useMutation(api.conversations.generateUploadUrl);
  const me = useQuery(api.users.getMe);
  const users = useQuery(api.users.getUsers);

  const { setSelectedConversation } = useConversationStore();

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return;
    setIsLoading(true);
    try {
      const isGroup = selectedUsers.length > 1;

      let conversationId;
      if (!isGroup) {
        conversationId = await createConversation({
          participants: [...selectedUsers, me?._id!],
          isGroup: false,
        });
      } else {
        const postUrl = await generateUploadUrl();

        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage?.type! },
          body: selectedImage,
        });

        const { storageId } = await result.json();

        conversationId = await createConversation({
          participants: [...selectedUsers, me?._id!],
          isGroup: true,
          admin: me?._id!,
          groupName,
          groupImage: storageId,
        });
      }

      dialogCloseRef.current?.click();
      setSelectedUsers([]);
      setGroupName("");
      setSelectedImage(null);

      // TODO => Update a global state called "selectedConversation"
      const conversationName = isGroup
        ? groupName
        : users?.find((user) => user._id === selectedUsers[0])?.name; // this just means if you're in a group chat or the conversation is a group chat, we get the group name else the other user's name

      setSelectedConversation({
        _id: conversationId,
        participants: selectedUsers,
        isGroup,
        image: isGroup
          ? renderedImage
          : users?.find((user) => user._id === selectedUsers[0])?.image,
        name: conversationName,
        admin: me?._id!,
      });
    } catch (err) {
      toast.error("Failed to create conversation");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedImage) return setRenderedImage("");
    const reader = new FileReader(); // java script api
    reader.onload = (e) => setRenderedImage(e.target?.result as string);
    reader.readAsDataURL(selectedImage);
  }, [selectedImage]);
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const filtered = users?.filter((user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered || []);
      if (filtered?.length === 0) {
        setErrorMessage("User not found");
      } else {
        setErrorMessage("");
      }
    } else {
      setFilteredUsers(null); // Reset the list when search is empty
      setErrorMessage(""); // Reset the error message
    }
  }, [searchTerm, users]);
  return (
    <Dialog>
      <DialogTrigger>
        <MessageSquareDiff size={20} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          {/* TODO: <DialogClose /> will be here */}
          <DialogClose ref={dialogCloseRef} />
          <DialogTitle>USERS</DialogTitle>
        </DialogHeader>

        <DialogDescription style={{ color: "black" }}>
          Start a new chat
        </DialogDescription>
        {renderedImage && (
          <div className="w-16 h-16 relative mx-auto">
            <Image
              src={renderedImage}
              fill
              alt="user image"
              className="rounded-full object-cover"
            />
          </div>
        )}
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: "2px solid black",
            padding: "8px",
            borderRadius: "4px",
          }}
        />

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {/* TODO: input file */}
        <input
          type="file"
          accept="image/*"
          ref={imgRef}
          hidden
          onChange={(e) => setSelectedImage(e.target.files![0])}
        />
        {selectedUsers.length > 1 && (
          <>
            <Input
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button
              className="flex gap-2"
              onClick={() => imgRef.current?.click()}
            >
              <ImageIcon size={20} />
              Group Image
            </Button>
          </>
        )}

        <div className="flex flex-col gap-3 overflow-auto max-h-60">
          {searchTerm.trim() === "" && users // Show all users if the search term is empty
            ? users?.map((user) => (
                <div
                  key={user._id}
                  className={`flex gap-3 items-center p-2 rounded cursor-pointer active:scale-95 
								transition-all ease-in-out duration-300
							${selectedUsers.includes(user._id) ? "bg-green-primary" : ""}`}
                  onClick={() => {
                    if (selectedUsers.includes(user._id)) {
                      setSelectedUsers(
                        selectedUsers.filter((id) => id !== user._id)
                      );
                    } else {
                      setSelectedUsers([...selectedUsers, user._id]);
                    }
                  }}
                >
                  <Avatar className="overflow-visible">
                    {user.isOnline && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground" />
                    )}

                    <AvatarImage
                      src={user.image}
                      className="rounded-full object-cover"
                    />
                    <AvatarFallback>
                      <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full"></div>
                    </AvatarFallback>
                  </Avatar>

                  <div className="w-full ">
                    <div className="flex items-center justify-between">
                      <p className="text-md font-medium">
                        {user.name || user.email.split("@")[0]}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            : filteredUsers &&
              filteredUsers.map(
                (
                  user // Show only filtered users if the search term has input
                ) => (
                  <div
                    key={user._id}
                    className={`flex gap-3 items-center p-2 rounded cursor-pointer active:scale-95 
								transition-all ease-in-out duration-300
                ${selectedUsers.includes(user._id) ? "bg-green-primary" : ""}`}
                    onClick={() => setSelectedUsers([user._id])}
                  >
                    <Avatar className="mr-2">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </div>
                )
              )}
        </div>
        <div className="flex justify-between">
          <Button
            variant={"outline"}
            onClick={() => dialogCloseRef.current?.click()}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateConversation}
            disabled={
              selectedUsers.length === 0 ||
              (selectedUsers.length > 1 && !groupName) ||
              isLoading
            }
          >
            {/* spinner */}
            {isLoading ? (
              <div className="w-5 h-5 border-t-2 border-b-2  rounded-full animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default UserListDialog;
