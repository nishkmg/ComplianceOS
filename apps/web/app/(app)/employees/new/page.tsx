"use client";

import { useState, useRef } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";

export default function NewEmployeePage() {
  const router = useRouter();
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.employeeCode.trim()) errs.employeeCode = "Required";
    if (!formData.firstName.trim()) errs.firstName = "Required";
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) errs.pan = "Invalid PAN format";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const createEmployee = api.employees.create.useMutation({
    onSuccess: () => {
      showToast.success("Employee record created successfully");
      router.push("/employees");
    },
    onError: (e) => {
      showToast.error(e.message);
      setSaving(false);
      savingRef.current = false;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (savingRef.current) return;
    if (!validate()) return;
    savingRef.current = true;
    setSaving(true);
    createEmployee.mutate({
      employeeCode: formData.employeeCode,
      firstName: formData.firstName,
      lastName: formData.lastName || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      pan: formData.pan,
      uan: formData.uan || undefined,
      dateOfJoining: formData.dateOfJoining,
      designation: formData.designation || undefined,
      department: formData.department || undefined,
    });
  };

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b-[0.5px] border-border px-8 py-4 -mx-8 -mt-8 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} aria-label="Go back" className="text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer" >
            <Icon name="arrow_back" />
          </button>
          <div>
            <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-1">HR Management</p>
            <h1 className="font-ui text-display-lg font-semibold text-dark">Statutory Register</h1>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.back()} className="btn btn-secondary" aria-label="Go back">Discard</button>
          <button onClick={handleSubmit} disabled={saving} className="btn btn-primary">
            {saving ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto pb-16">
        <div className="bg-surface border border-border shadow-sm overflow-hidden">
          <div className="h-[2px] w-full bg-amber"></div>

          <div className="p-8 space-y-8">
            {/* Section: Personal Details */}
            <section>
              <h3 className="font-ui text-ui-2xs text-amber uppercase tracking-widest mb-6 border-b-[0.5px] border-border pb-2 font-bold">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-code" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Employee Code *</label>
                  <input id="emp-code" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" value={formData.employeeCode} onChange={e => setFormData({...formData, employeeCode: e.target.value})} required placeholder="EMP-2024-XXX" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-first-name" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">First Name *</label>
                  <input id="emp-first-name" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-last-name" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Last Name</label>
                  <input id="emp-last-name" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-email" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Email Address</label>
                  <input id="emp-email" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="employee@firm.in" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-phone" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Phone No.</label>
                  <input id="emp-phone" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-doj" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Date of Joining *</label>
                  <input id="emp-doj" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" type="date" value={formData.dateOfJoining} onChange={e => setFormData({...formData, dateOfJoining: e.target.value})} required />
                </div>
              </div>
            </section>

            {/* Section: Statutory Identifiers */}
            <section>
              <h3 className="font-ui text-ui-2xs text-amber uppercase tracking-widest mb-6 border-b-[0.5px] border-border pb-2 font-bold">Statutory Identifiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-pan" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">PAN Number *</label>
                  <input id="emp-pan" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm uppercase outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value.toUpperCase()})} maxLength={10} placeholder="ABCDE1234F" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-uan" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">UAN Number</label>
                  <input id="emp-uan" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" value={formData.uan} onChange={e => setFormData({...formData, uan: e.target.value})} placeholder="1000987654321" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-entity" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Entity / Company</label>
                  <input id="emp-entity" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} placeholder="Main entity" />
                </div>
              </div>
            </section>

            {/* Section: Employment */}
            <section>
              <h3 className="font-ui text-ui-2xs text-amber uppercase tracking-widest mb-6 border-b-[0.5px] border-border pb-2 font-bold">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-designation" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Designation</label>
                  <input id="emp-designation" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="Senior Analyst" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-department" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Department</label>
                  <input id="emp-department" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Compliance" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}
