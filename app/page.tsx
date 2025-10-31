/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDrag, useDrop } from "react-dnd";
import { CheckCircle, Edit2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateTodo,
  useDeleteTodo,
  useGetTodos,
  useUpdateTodo,
} from "@/lib/hooks/todo";
import { ITodo } from "@/types/common";
import { useQueryClient } from "@tanstack/react-query";

export default function TodoPage() {
  const { todos, isLoading } = useGetTodos();
  const { updateTodo } = useUpdateTodo();
  const { deleteTodo } = useDeleteTodo();

  const [showForm, setShowForm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<ITodo | null>(null);

  const queryClient = useQueryClient();

  const handleComplete = (todo: ITodo) => {
    updateTodo(
      { id: todo._id, data: { ...todo, completed: true } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteTodo(id);
  };

  const handleEdit = (todo: ITodo) => {
    setSelectedTodo(todo);
    setShowForm(true);
  };
  const todosList = todos?.filter((t: ITodo) => !t.completed) || [];
  const completedList = todos?.filter((t: ITodo) => t.completed) || [];

  if (isLoading)
    return <p className="text-center mt-10 text-green-600">Loading Todos...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-green-200 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">
          🌿 My Todo List
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Todo Section */}
          <TodoSection
            title="Todo List"
            todos={todosList}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
            updateTodo={updateTodo}
          />

          {/* Completed Section */}
          <CompletedSection todos={completedList} />
        </div>

        {/* Floating Add Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowForm(true)}
          className="fixed bottom-10 right-10 bg-green-600 text-white p-4 rounded-full shadow-xl hover:bg-green-700"
        >
          <Plus className="h-6 w-6" />
        </motion.button>

        {showForm && (
          <TodoForm
            todo={selectedTodo}
            onClose={() => {
              setShowForm(false);
              setSelectedTodo(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ──────────────── COMPONENTS ──────────────── */

function TodoSection({
  title,
  todos,
  onComplete,
  onDelete,
  onEdit,
  updateTodo,
}: any) {
  const [, drop] = useDrop({
    accept: "TODO",
    drop: (item: any) => updateTodo({ ...item.todo, completed: false }),
  });

  return (
    <Card
      ref={drop}
      className="bg-white/70 backdrop-blur-md border-green-300 shadow-lg"
    >
      <CardHeader>
        <CardTitle className="text-green-800 flex justify-between items-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todos.length === 0 ? (
          <p className="text-green-700 italic">No todos yet 🌱</p>
        ) : (
          todos.map((todo: ITodo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onComplete={onComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function CompletedSection({ todos }: { todos: ITodo[] }) {
  const [, drop] = useDrop({
    accept: "TODO",
    drop: (item: any) => item.onComplete(item.todo),
  });

  return (
    <Card ref={drop} className="bg-emerald-50 border-emerald-300 shadow-lg">
      <CardHeader>
        <CardTitle className="text-green-800">Completed ✅</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todos.length === 0 ? (
          <p className="text-green-700 italic">Nothing completed yet 🌼</p>
        ) : (
          todos.map((todo: ITodo) => (
            <motion.div
              key={todo._id}
              className="bg-emerald-100 border border-emerald-300 p-3 rounded-lg shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-green-800 font-semibold">{todo?.title}</p>
              <p className="text-green-700 text-sm">{todo?.description}</p>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function TodoItem({ todo, onComplete, onDelete, onEdit }: any) {
  const [{ isDragging }, drag] = useDrag({
    type: "TODO",
    item: { todo, onComplete },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <motion.div
      ref={drag}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`flex justify-between items-center p-3 rounded-lg shadow-sm border border-green-300 ${
        isDragging ? "opacity-50" : "bg-green-50"
      }`}
    >
      <div>
        <h3 className="font-semibold text-green-900">{todo.title}</h3>
        <p className="text-sm text-green-700">{todo.description}</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onComplete(todo)}
          className="text-green-600 hover:text-green-800"
        >
          <CheckCircle size={18} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(todo)}
          className="text-green-600 hover:text-green-800"
        >
          <Edit2 size={18} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(todo._id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={18} />
        </Button>
      </div>
    </motion.div>
  );
}

function TodoForm({
  todo,
  onClose,
}: {
  todo?: ITodo | null;
  onClose: () => void;
}) {
  const isEdit = !!todo;
  const { createTodo } = useCreateTodo();
  const { updateTodo } = useUpdateTodo();

  const [title, setTitle] = useState(todo?.title || "");
  const [description, setDescription] = useState(todo?.description || "");

  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit)
      updateTodo({ id: todo._id, data: { ...todo, title, description } });
    else
      createTodo(
        { title, description },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
          },
        }
      );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-green-800">
            {isEdit ? "Edit Todo" : "Add New Todo"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-green-300 focus:ring-green-500"
            />
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-green-300 focus:ring-green-500"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isEdit ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
