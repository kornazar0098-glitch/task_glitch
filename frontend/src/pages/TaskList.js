import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure } from '../redux/taskSlice';
import { taskService } from '../services/serviceAPI';
import '../styles/TaskList.css';

function TaskList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, loading, pagination } = useSelector((state) => state.tasks);
  const [filters, setFilters] = useState({
    category: '',
    status: 'open',
    minBudget: '',
    maxBudget: '',
    page: 1,
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    dispatch(fetchTasksStart());
    try {
      const response = await taskService.getAllTasks({
        ...filters,
        limit: 10,
      });
      dispatch(fetchTasksSuccess(response.data));
    } catch (error) {
      dispatch(fetchTasksFailure(error.message));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  return (
    <div className="task-list-container">
      <div className="filters">
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">تمام دسته‌بندی‌ها</option>
          <option value="shopping">خریداری</option>
          <option value="delivery">تحویل</option>
          <option value="cleaning">نظافت</option>
          <option value="handyman">تعمیرات</option>
          <option value="moving">اسباب‌کشی</option>
          <option value="pet-care">مراقبت از حیوانات</option>
          <option value="personal-errands">امور شخصی</option>
        </select>

        <input
          type="number"
          name="minBudget"
          placeholder="حداقل بودجه"
          value={filters.minBudget}
          onChange={handleFilterChange}
          className="filter-input"
        />

        <input
          type="number"
          name="maxBudget"
          placeholder="حداکثر بودجه"
          value={filters.maxBudget}
          onChange={handleFilterChange}
          className="filter-input"
        />
      </div>

      <div className="tasks-grid">
        {tasks.map((task) => (
          <div key={task.id} className="task-card" onClick={() => handleTaskClick(task.id)}>
            <div className="task-header">
              <h3>{task.title}</h3>
              <span className="task-category">{task.category}</span>
            </div>
            <p className="task-description">{task.description.substring(0, 100)}...</p>
            <div className="task-footer">
              <span className="task-budget">₹{task.budget}</span>
              <span className="task-location">{task.location}</span>
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: i + 1 }))}
              className={pagination.page === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;
