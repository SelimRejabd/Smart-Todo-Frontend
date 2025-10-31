export type IErrorResponse = {
  response: {
    data: {
      message: string;
    };
  };
} | null;

export type ITodo = {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
};
