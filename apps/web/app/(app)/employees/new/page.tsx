// @ts-nocheck
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewEmployeePage() {
  const router = useRouter();
  const createEmployee = api.employees.create.useMutation({
    onSuccess: () => {
      router.push("/employees");
    },
  });

  const [formData, setFormData] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    pan: "",
    dateOfJoining: "",
    designation: "",
    department: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmployee.mutate(formData as any);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Add Employee</h1>
          <p className="font-ui text-[12px] text-light mt-1">Create new employee record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
        <div className="card p-6">
          <h2 className="font-display text-[16px] font-normal text-dark mb-4">Employee Details</h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="font-ui text-[10px] uppercase tracking-wide text-light">Employee Code <span className="text-danger">*</span></label>
              <input
                required
                type="text"
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                className="input-field font-ui"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-ui text-[10px] uppercase tracking-wide text-light">PAN <span className="text-danger">*</span></label>
              <input
                required
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                placeholder="ABCDE1234F"
                className="input-field font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-ui text-[10px] uppercase tracking-wide text-light">First Name <span className="text-danger">*</span></label>
              <input
                required
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-field font-ui"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-ui text-[10px] uppercase tracking-wide text-light">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-field font-ui"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-ui text-[10px] uppercase tracking-wide text-light">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field font-ui"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-ui text-[10px] uppercase tracking-wide text-light">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field font-ui"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-ui text-[10px] uppercase tracking-wide text-light">Date of Joining <span className="text-danger">*</span></label>
              <input
                required
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                className="input-field font-ui"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-ui text-[10px] uppercase tracking-wide text-light">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="input-field font-ui"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-ui text-[10px] uppercase tracking-wide text-light">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-field font-ui"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createEmployee.isPending}
            className="filter-tab active disabled:opacity-50"
          >
            {createEmployee.isPending ? "Creating..." : "Create Employee"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="filter-tab"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
