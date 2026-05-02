"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

export default function NewEmployeePage() {
  const router = useRouter();
  const createEmployee: any = api.employees.create.useMutation({
    onSuccess: () => {
      showToast.success("Employee record created successfully");
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
    uan: "",
    dateOfJoining: "",
    designation: "",
    department: "",
    entityName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmployee.mutate(formData as any);
  };

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b-[0.5px] border-border px-8 py-4 -mx-8 -mt-8 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer">
            <Icon name="arrow_back" />
          </button>
          <div>
            <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-1">HR Management</p>
            <h1 className="font-display text-display-lg font-semibold text-dark">Statutory Register</h1>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.back()} className="btn btn-secondary">Discard</button>
          <button onClick={handleSubmit} disabled={createEmployee.isPending} className="btn btn-primary">
            {createEmployee.isPending ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto pb-16">
        <div className="bg-surface border border-border shadow-sm overflow-hidden">
          <div className="h-[2px] w-full bg-amber"></div>

          <div className="p-8 space-y-8">
            {/* Section: Personal Details */}
            <section>
              <h3 className="font-ui text-[10px] text-amber-text uppercase tracking-widest mb-6 border-b-[0.5px] border-border pb-2 font-bold">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Employee Code *</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus:border-primary" value={formData.employeeCode} onChange={e => setFormData({...formData, employeeCode: e.target.value})} required placeholder="EMP-2024-XXX" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">First Name *</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus:border-primary" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Last Name</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus:border-primary" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Email Address</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus:border-primary" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="employee@firm.in" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Phone No.</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus:border-primary" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Date of Joining *</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus:border-primary" type="date" value={formData.dateOfJoining} onChange={e => setFormData({...formData, dateOfJoining: e.target.value})} required />
                </div>
              </div>
            </section>

            {/* Section: Statutory Identifiers */}
            <section>
              <h3 className="font-ui text-[10px] text-amber-text uppercase tracking-widest mb-6 border-b-[0.5px] border-border pb-2 font-bold">Statutory Identifiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">PAN Number *</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm uppercase outline-none focus:border-primary" value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value.toUpperCase()})} maxLength={10} placeholder="ABCDE1234F" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">UAN Number</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm outline-none focus:border-primary" value={formData.uan} onChange={e => setFormData({...formData, uan: e.target.value})} placeholder="1000987654321" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Entity / Company</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus:border-primary" value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} placeholder="Main entity" />
                </div>
              </div>
            </section>

            {/* Section: Employment */}
            <section>
              <h3 className="font-ui text-[10px] text-amber-text uppercase tracking-widest mb-6 border-b-[0.5px] border-border pb-2 font-bold">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Designation</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus:border-primary" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="Senior Analyst" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Department</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus:border-primary" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Compliance" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}
