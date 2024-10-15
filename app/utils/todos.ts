import type {Todo} from '~/types';
import {prisma} from './prisma.server';

export function createTodo(data: Todo): Promise<Todo> {
  return prisma.todo.create({data});
}

export function deleteTodo(id: number): Promise<Todo> {
  return prisma.todo.delete({where: {id}});
}

export function getTodos(): Promise<Todo[]> {
  return prisma.todo.findMany();
}

export async function toggleDone(id: number): Promise<Todo> {
  const todo = await prisma.todo.findUnique({where: {id}});
  return prisma.todo.update({
    where: {id},
    data: {done: !todo?.done}
  });
}

export function updateTodo(id: number, text: string): Promise<Todo> {
  return prisma.todo.update({where: {id}, data: {text}});
}
