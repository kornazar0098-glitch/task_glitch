import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasksStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTasksSuccess: (state, action) => {
      state.loading = false;
      state.tasks = action.payload.tasks;
      state.pagination = action.payload.pagination;
    },
    fetchTasksFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchTaskByIdStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTaskByIdSuccess: (state, action) => {
      state.loading = false;
      state.currentTask = action.payload;
    },
    fetchTaskByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createTaskStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createTaskSuccess: (state, action) => {
      state.loading = false;
      state.tasks.unshift(action.payload);
    },
    createTaskFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
});

export const {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  fetchTaskByIdStart,
  fetchTaskByIdSuccess,
  fetchTaskByIdFailure,
  createTaskStart,
  createTaskSuccess,
  createTaskFailure,
  clearCurrentTask,
} = taskSlice.actions;
export default taskSlice.reducer;
