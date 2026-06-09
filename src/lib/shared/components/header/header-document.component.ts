export const OPERATIONS_BY_TYPE_DOCUMENT: Record< string , string[]>={
    '01':['0101','1001','0401','2106','0200','0201','0208','0202','0205','0203','0204','0206','0207'],
    '03':['0101','1001','0401','0200','0201','0208','0205','0203','0204','0206','0207'],

}
export interface CatalogItem {
    value: string
    label: string
}
export function filterOperationsByDocumentType(type: string, catalog: CatalogItem[]): CatalogItem[] {
  const allowed = OPERATIONS_BY_TYPE_DOCUMENT[type] ?? []
  return catalog.filter((op) => allowed.includes(op.value))
}