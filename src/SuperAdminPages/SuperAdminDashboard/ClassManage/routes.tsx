import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ClassList, AddClass, EditClass, ViewClass } from '.';

export const ClassRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ClassList />} />
      <Route path="add" element={<AddClass />} />
      <Route path=":id" element={<ViewClass />} />
      <Route path="edit/:id" element={<EditClass />} />
    </Routes>
  );
};

export default ClassRoutes;
