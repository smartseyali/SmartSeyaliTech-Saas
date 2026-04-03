import type { DocTypeDef } from "../types";

export const hrmsEmployee: DocTypeDef = {
  name: "Employee",
  tableName: "hrms_employees",
  module: "hrms",
  icon: "Users",
  listTitle: "Employee Directory",
  formTitle: "Employee",
  showItems: false,

  defaults: {
    status: "active",
  },

  headerFields: [
    { key: "employee_code", label: "Employee ID", required: true, placeholder: "EMP-2026-001" },
    { key: "full_name", label: "Employee Name", required: true, placeholder: "John Doe..." },
    { key: "email", label: "Email Address", placeholder: "john.doe@company.com" },
    {
      key: "department_id", label: "Department", type: "select",
      options: [
        { label: "Engineering", value: "1" },
        { label: "Finance", value: "2" },
        { label: "Operations", value: "3" },
      ],
    },
    {
      key: "designation_id", label: "Designation", type: "select",
      options: [
        { label: "Software Engineer", value: "1" },
        { label: "Accountant", value: "2" },
        { label: "Manager", value: "3" },
      ],
    },
    { key: "joining_date", label: "Joining Date", type: "date" },
    {
      key: "status", label: "Status", type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "On Leave", value: "leave" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ],

  columns: [
    { key: "name", label: "Employee" },
    { key: "department", label: "Department" },
    { key: "contact", label: "Contact Info" },
    { key: "status", label: "Status" },
  ],
};
