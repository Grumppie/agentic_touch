import { icons, ShieldAlertIcon } from "lucide-react";

import{
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item'
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const UnAuthenticatedView = ()=>{
    return(
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="w-full max-w-lg bg-muted">
                <Item variant={"outline"}>
                    <ItemMedia variant={"icon"}>
                        <ShieldAlertIcon />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>UnAuthorized Access</ItemTitle>
                        <ItemDescription>You are not authorized to use this page!</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <SignInButton>
                            <Button variant={"destructive"}>
                                Sign in
                            </Button>
                        </SignInButton>
                        <SignUpButton>
                            <Button variant={"secondary"}>
                                Sign Up
                            </Button>
                        </SignUpButton>
                    </ItemActions>
                </Item>
            </div>
        </div>
    )
}