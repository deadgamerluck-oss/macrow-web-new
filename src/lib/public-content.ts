import { queryOptions } from "@tanstack/react-query";
import { listPublishedPosts, listPublishedProjects } from "./public-content.functions";

export const publishedPostsQuery = queryOptions({ queryKey: ["public", "blog_posts"], queryFn: () => listPublishedPosts(), staleTime: 60_000 });
export const publishedProjectsQuery = queryOptions({ queryKey: ["public", "work_projects"], queryFn: () => listPublishedProjects(), staleTime: 60_000 });