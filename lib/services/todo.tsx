import { ITodo } from "@/types/common";
import API from "../axiosClient/axiosClient";

export const getTodosFn = async () => await API.get("/todos");

export const getTodoFn = async (id: string) => await API.get(`/todos/${id}`);

export const createTodoFn = async (data: ITodo) =>
  await API.post("/todos", data);

export const updateTodoFn = async (id: string, data: Partial<ITodo>) =>
  await API.patch(`/todos/${id}`, data);

export const deleteTodoFn = async (id: string) =>
  await API.delete(`/todos/${id}`);
