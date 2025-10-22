import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HelpCircle, Settings } from "lucide-react";
import LinkIcon from "./IconLink";
import NotificationsPopover from "./NotificationsPopover";
import UserMenu from "./UserMenu";

function Header() {
  return (
    <header className="flex items-center justify-between p-4.5  ">
      <div className="flex items-center ">
        <SidebarTrigger className="mr-4" />
      </div>
      <div className="flex h-5 items-center space-x-1">
        <div className="flex items-center space-x-1 ">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center p-1 rounded-md hover:bg-accent">
                <HelpCircle className="w-5 h-5 font-bold group-hover:scale-110 transition-transform" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <a href="https://help.penguinmails.com/knowledge-base" target="_blank">Knowledge Base</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://help.penguinmails.com/support" target="_blank">Support</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://help.penguinmails.com/video-tutorials" target="_blank">Video Tutorials</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://help.penguinmails.com/glossary" target="_blank">Glossary</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://help.penguinmails.com/our-services" target="_blank">Our Services</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NotificationsPopover />
          <LinkIcon href="/dashboard/settings">
            <Settings className="w-5 h-5 font-bold group-hover:scale-110 transition-transform" />
          </LinkIcon>
        </div>
        <Separator orientation="vertical" className="mx-2 -ml-1.5" />
        <UserMenu />
      </div>
    </header>
  );
}
export default Header;
