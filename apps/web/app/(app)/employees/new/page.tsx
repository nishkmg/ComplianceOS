"use client";

import { useState, useRef } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewEmployeePage() {
  const router = useRouter();
  const utils = api.useUtils();
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
      void utils.employees.list.invalidate();
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
            <PageHeader title="Create Employee" />
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.back()} aria-label="Go back">Discard</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Creating..." : "Create Employee"}
          </Button>
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
                  <Input id="emp-code" value={formData.employeeCode} onChange={e => setFormData({...formData, employeeCode: e.target.value})} required placeholder="EMP-2024-XXX" />
                  {errors.employeeCode && <p role="alert" className="text-danger font-ui text-ui-sm mt-1.5">{errors.employeeCode}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-first-name" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">First Name *</label>
                  <Input id="emp-first-name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                  {errors.firstName && <p className="text-danger font-ui text-ui-sm mt-1.5">{errors.firstName}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-last-name" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Last Name</label>
                  <Input id="emp-last-name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-email" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Email Address</label>
                  <Input id="emp-email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="employee@firm.in" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-phone" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Phone No.</label>
                  <Input id="emp-phone" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-doj" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Date of Joining *</label>
                  <Input id="emp-doj" type="date" value={formData.dateOfJoining} onChange={e => setFormData({...formData, dateOfJoining: e.target.value})} required />
                </div>
              </div>
            </section>

            {/* Section: Statutory Identifiers */}
            <section>
              <h3 className="font-ui text-ui-2xs text-amber uppercase tracking-widest mb-6 border-b-[0.5px] border-border pb-2 font-bold">Statutory Identifiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-pan" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">PAN Number *</label>
                  <Input id="emp-pan" className="font-mono uppercase" value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value.toUpperCase()})} maxLength={10} placeholder="ABCDE1234F" required />
                  {errors.pan && <p className="text-danger font-ui text-ui-sm mt-1.5">{errors.pan}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-uan" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">UAN Number</label>
                  <Input id="emp-uan" className="font-mono" value={formData.uan} onChange={e => setFormData({...formData, uan: e.target.value})} placeholder="1000987654321" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-entity" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Entity / Company</label>
                  <Input id="emp-entity" value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} placeholder="Main entity" />
                </div>
              </div>
            </section>

            {/* Section: Employment */}
            <section>
              <h3 className="font-ui text-ui-2xs text-amber uppercase tracking-widest mb-6 border-b-[0.5px] border-border pb-2 font-bold">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-designation" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Designation</label>
                  <Input id="emp-designation" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="Senior Analyst" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="emp-department" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Department</label>
                  <Input id="emp-department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Compliance" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}
