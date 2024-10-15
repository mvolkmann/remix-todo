import type {Todo} from '~/types';
import {prisma} from './prisma.server';

export function createTodo(data: Todo) {
  return prisma.todo.create({data});
}

export function deleteTodo(id: number) {
  return prisma.todo.deleteMany({where: {id}});
}

export function getTodos(): Promise<Todo[]> {
  return prisma.todo.findMany();
}

export async function toggleDone(id: number) {
  const todo = await prisma.todo.findUnique({where: {id}});
  return prisma.todo.update({
    where: {id},
    data: {done: !todo?.done}
  });
}

export function updateTodo(id: number, text: string) {
  const data = {text};
  return prisma.todo.update({where: {id}, data});
}
