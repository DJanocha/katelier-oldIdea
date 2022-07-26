import { Project } from "src/models";

export const countAllProjects = async () => Project.find().count()
