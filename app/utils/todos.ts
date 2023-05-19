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

export function updateTodo(data: Todo) {
  return prisma.todo.update({where: {id: data.id}, data});
}
