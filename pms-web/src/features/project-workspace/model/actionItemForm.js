export function actionItemToWritePayload(item, overrides = {}) {
  if (!item?.plannedSchedule)
    throw new Error(
      'This Action Item does not have a planned schedule to preserve.',
    )
  return {
    categoryId: item.categoryId,
    subCategoryId: item.subCategoryId,
    actionItemName: item.actionItemName,
    description: item.description,
    priority: item.priority,
    ownerName: item.ownerName,
    ownerId: item.ownerId,
    weight: item.weight,
    sequence: item.sequence,
    remarks: item.remarks,
    plannedStartDate: item.plannedSchedule.plannedStartDate,
    plannedEndDate: item.plannedSchedule.plannedEndDate,
    actualStartDate: item.actualExecution?.actualStartDate ?? null,
    actualEndDate: item.actualExecution?.actualEndDate ?? null,
    actualHours: item.actualExecution?.actualHours ?? null,
    delayReason: item.actualExecution?.delayReason ?? null,
    ...overrides,
  }
}

export function quickActionItemPayload(form, categoryId, project, members) {
  const selected = members.find((member) => member.userId === form.ownerId)
  return {
    categoryId,
    subCategoryId: form.subCategoryId || null,
    actionItemName: form.actionItemName.trim(),
    description: null,
    priority: Number(form.priority),
    ownerName: selected
      ? `${selected.firstName} ${selected.lastName}`.trim()
      : null,
    ownerId: form.ownerId || null,
    weight: project.progressMode === 1 ? Number(form.weight) : null,
    sequence: Number(form.sequence),
    remarks: null,
    plannedStartDate: form.plannedStartDate,
    plannedEndDate: form.plannedEndDate,
    actualStartDate: form.actualStartDate || null,
    actualEndDate: form.actualEndDate || null,
    actualHours: null,
    delayReason: null,
  }
}
