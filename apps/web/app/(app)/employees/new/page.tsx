// @ts-nocheck
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

export default function NewEmployeePage() {
  const router = useRouter();
  const createEmployee = api.employees.create.useMutation({
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
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b-[0.5px] border-border-subtle px-8 py-4 -mx-8 -mt-8 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-text-mid hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-display-lg text-lg font-bold uppercase tracking-widest">Statutory Register</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.back()} className="px-6 py-2.5 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors cursor-pointer bg-transparent rounded-sm shadow-sm">Discard</button>
          <button onClick={handleSubmit} disabled={createEmployee.isPending} className="px-8 py-2.5 bg-primary-container text-white font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all cursor-pointer border-none rounded-sm shadow-sm">
            {createEmployee.isPending ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto pb-16">
        <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden">
          <div className="h-[2px] w-full bg-primary-container"></div>

          <div className="p-8 space-y-8">
            {/* Section: Personal Details */}
            <section>
              <h3 className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest mb-6 border-b-[0.5px] border-border-subtle pb-2 font-bold">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Employee Code *</label>
                  <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 text-sm outline-none focus:border-primary" value={formData.employeeCode} onChange={e => setFormData({...formData, employeeCode: e.target.value})} required placeholder="EMP-2024-XXX" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">First Name *</label>
                  <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 text-sm outline-none focus:border-primary" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Last Name</label>
                  <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 text-sm outline-none focus:border-primary" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Email Address</label>
                  <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 text-sm outline-none focus:border-primary" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="employee@firm.in" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Phone No.</label>
                  <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 text-sm outline-none focus:border-primary" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Date of Joining *</label>
                  <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 text-sm outline-none focus:border-primary" type="date" value={formData.dateOfJoining} onChange={e => setFormData({...formData, dateOfJoining: e.target.value})} required />
                </div>
              </div>
            </section>

            {/* Section: Statutory Identifiers */}
            <section>
              <h3 className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest mb-6 border-b-[0.5px] border-border-subtle pb-2 font-bold">Statutory Identifiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">PAN Number *</label>
                  <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-mono text-sm uppercase outline-none focus:border-primary" value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value.toUpperCase()})} maxlength={10} placeholder="ABCDE1234F" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">UAN Number</label>
                  <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-mono text-sm outline-none focus:border-primary" value={formData.uan} onChange={e => setFormData({...formData, uan: e.target.value})} placeholder="1000987654321" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Entity / Company</label>
                  <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 text-sm outline-none focus:border-primary" value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} placeholder="Main entity" />
                </div>
              </div>
            </section>

            {/* Section: Employment */}
            <section>
              <h3 className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest mb-6 border-b-[0.5px] border-border-subtle pb-2 font-bold">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Designation</label>
                  <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 text-sm outline-none focus:border-primary" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="Senior Analyst" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Department</label>
                  <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 text-sm outline-none focus:border-primary" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Compliance" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}
