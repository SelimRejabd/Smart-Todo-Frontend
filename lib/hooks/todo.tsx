import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createTodoFn,
  deleteTodoFn,
  getTodoFn,
  getTodosFn,
  updateTodoFn,
} from "../services/todo";
import { IErrorResponse, ITodo } from "@/types/common";

export const useGetTodos = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["todos"],
    queryFn: () => getTodosFn(),
  });
  console.log(data);
  const todos = data ? data?.data?.data || [] : [];
  return { todos, isLoading, error };
};

export const useGetTodo = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["todo", id],
    queryFn: () => getTodoFn(id),
  });
  const todo = data ? data?.data?.data || {} : {};
  return { todo, isLoading, error };
};

export const useCreateTodo = () => {
  const {
    mutate: createTodo,
    data,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: (data: ITodo) => createTodoFn(data),
  });
  const errorMessage = (error as IErrorResponse)?.response?.data?.message || "";
  return { createTodo, data, isLoading, error, errorMessage };
};

export const useUpdateTodo = () => {
  const {
    mutate: updateTodo,
    data,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ITodo> }) =>
      updateTodoFn(id, data),
  });
  const errorMessage = (error as IErrorResponse)?.response?.data?.message || "";
  return { updateTodo, data, isLoading, error, errorMessage };
};

export const useDeleteTodo = () => {
  const {
    mutate: deleteTodo,
    data,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: (id: string) => deleteTodoFn(id),
  });
  const errorMessage = (error as IErrorResponse)?.response?.data?.message || "";
  return { deleteTodo, data, isLoading, error, errorMessage };
};
