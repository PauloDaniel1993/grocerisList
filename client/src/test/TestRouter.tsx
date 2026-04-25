import {
  MemoryRouter,
  type MemoryRouterProps,
} from "react-router-dom";

const future = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

export function TestRouter(props: MemoryRouterProps) {
  return <MemoryRouter future={future} {...props} />;
}
