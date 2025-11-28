 
import { createTRPCReact } from "@trpc/react-query";
import type { AnyRouter } from "@trpc/server";
import type { ComponentType } from "react";

type LooseTrpcHooks = {
	Provider: ComponentType<any>;
	createClient: any;
	useContext?: any;
	useUtils?: any;
	useQuery?: any;
	useSuspenseQuery?: any;
	useMutation?: any;
	useSubscription?: any;
	useInfiniteQuery?: any;
};

// Recursive proxy type that exposes arbitrary nested routers plus common TRPC hooks.
type LooseTrpcProxy = LooseTrpcHooks & {
	[key: string]: LooseTrpcProxy;
};

export const trpc = createTRPCReact<AnyRouter>() as unknown as LooseTrpcProxy;
