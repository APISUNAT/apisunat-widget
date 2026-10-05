import { get } from 'svelte/store'
import { documentStore, documentTypeStore } from '$lib/store/document.store'
import {
    getCreditoAmountFromTerms,
    validateCuotas,
    type Cuota,
} from '$lib/shared/components/payment-terms/payment-terms.component'

export interface ValidationError {
    field: string
    message: string
}

const LINE_KEY: Record<string, string> = {
    '07': 'cac:CreditNoteLine',
    '08': 'cac:DebitNoteLine',
    '09': 'cac:DespatchLine',
    '31': 'cac:DespatchLine',
}

function collectCreditPaymentErrors(doc: Record<string, any>): ValidationError[] {
    const terms = Array.isArray(doc['cac:PaymentTerms']) ? doc['cac:PaymentTerms'] : []
    const hasCredito = terms.some((t: any) => t?.['cbc:PaymentMeansID']?._text === 'Credito')
    if (!hasCredito) return []

    const errors: ValidationError[] = []
    const cuotasTerms = terms.filter((t: any) =>
        /^Cuota\d{3}$/.test(t?.['cbc:PaymentMeansID']?._text ?? ''),
    )

    if (cuotasTerms.length === 0) {
        errors.push({ field: 'paymentTerms', message: 'Agrega las cuotas de pago' })
        return errors
    }

    const cuotas: Cuota[] = cuotasTerms.map((t: any, i: number) => ({
        id: i + 1,
        monto: String(t?.['cbc:Amount']?._text ?? ''),
        vencimiento: t?.['cbc:PaymentDueDate']?._text ?? '',
    }))

    for (const [index, cuota] of cuotas.entries()) {
        if (!cuota.vencimiento?.trim()) {
            errors.push({
                field: 'paymentTerms',
                message: `La cuota ${index + 1} necesita fecha de vencimiento`,
            })
        }
    }

    const issueDate = doc['cbc:IssueDate']?._text ?? ''
    const currency = doc['cbc:DocumentCurrencyCode']?._text ?? 'PEN'
    const payable = Number(doc['cac:LegalMonetaryTotal']?.['cbc:PayableAmount']?._text ?? 0)
    const detraccion = terms.find((t: any) => t?.['cbc:ID']?._text === 'Detraccion')
    const montoDetraccion = Number(detraccion?.['cbc:Amount']?._text ?? 0)
    const hostCredito = getCreditoAmountFromTerms(terms)

    const fieldErrors = validateCuotas(
        cuotas,
        payable,
        issueDate,
        Number.isFinite(montoDetraccion) ? montoDetraccion : 0,
        currency,
        hostCredito,
    )

    for (const err of Object.values(fieldErrors)) {
        if (err.vencimiento) {
            errors.push({ field: 'paymentTerms', message: err.vencimiento })
        }
        if (err.monto) {
            errors.push({ field: 'paymentTerms', message: err.monto })
        }
    }

    return errors
}

export function validateDocument(): ValidationError[] {
    const doc = get(documentStore)
    const type = get(documentTypeStore)
    const errors: ValidationError[] = []
    const isNote = ['07', '08'].includes(type ?? '')
    const isGuia = ['09', '31'].includes(type ?? '')
    // Valida que el valor de _text no esté vacío
    const isEmpty = (value: string | undefined) => !value?.trim()
    // La fecha de emisión es obligatoria
    if (isEmpty(doc['cbc:IssueDate']?._text))
        errors.push({ field: 'issueDate', message: 'La fecha de emisión es requerida' })
    // Para facturas y boletas, la moneda es obligatoria
    if (!isGuia && isEmpty(doc['cbc:DocumentCurrencyCode']?._text))
        errors.push({ field: 'currency', message: 'Selecciona la moneda' })
    // Para facturas y boletas, el tipo de operación es obligatorio
    if (
        !isNote &&
        !isGuia &&
        isEmpty(doc['cbc:InvoiceTypeCode']?._attributes?.listID)
    ) {
        errors.push({
            field: 'operationType',
            message: 'Selecciona el tipo de operación'
        })
    }
    // Para guías, validar tipo de operación de traslado
    if (isGuia && isEmpty(doc['cac:Shipment']?.['cbc:HandlingCode']?._text)) {
        errors.push({
            field: 'handlingCode',
            message: 'Selecciona el tipo de operación'
        })
    }
    // Validaciones de cliente (solo para facturas/boletas/notas, no para guías)
    if (!isGuia) {
        if (isEmpty(doc['cac:AccountingCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._attributes?.schemeID))
            errors.push({ field: 'customer', message: 'Selecciona Tipo de Documento del Cliente' })
        //Valida el numero de documento del cliente solo salta si es sin documento
        if (doc['cac:AccountingCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._attributes?.schemeID !== '-') {
            if (isEmpty(doc['cac:AccountingCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text))
                errors.push({ field: 'customerNumber', message: 'El número de documento del cliente es requerido' })
        }
    }

    // Validaciones de emisor (aplica para todos los documentos)
    if (!isGuia) {
        //valida el numero de documento del emisor
        if (isEmpty(doc['cac:AccountingSupplierParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text))
            errors.push({ field: 'supplierNumber', message: 'El número de documento del emisor es requerido' })
        //valida el nombre del emisor
        if (isEmpty(doc['cac:AccountingSupplierParty']?.['cac:Party']?.['cac:PartyLegalEntity']?.['cbc:RegistrationName']?._text))
            errors.push({ field: 'supplierName', message: 'El nombre del emisor es requerido' })
    } else {
        // Para guías validar DespatchSupplierParty
        if (isEmpty(doc['cac:DespatchSupplierParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text))
            errors.push({ field: 'supplierNumber', message: 'El número de documento del emisor es requerido' })
        if (isEmpty(doc['cac:DespatchSupplierParty']?.['cac:Party']?.['cac:PartyLegalEntity']?.['cbc:RegistrationName']?._text))
            errors.push({ field: 'supplierName', message: 'El nombre del emisor es requerido' })
    }
    // Valida que el array de líneas no esté vacío
    const lineKey = LINE_KEY[type ?? ''] ?? 'cac:InvoiceLine'
    if (!doc[lineKey]?.length)
        errors.push({ field: 'lines', message: 'Agrega al menos un ítem' }
        )

    // Validaciones de pago y detracción (solo para facturas/boletas/notas, no para guías)
    if (!isGuia) {
        errors.push(...collectCreditPaymentErrors(doc))

        // El disparador real de "operación sujeta a detracción" es el tipo de
        // operación (catálogo 51, código 1001) — NO la existencia de PaymentTerms.
        // Ambos deben estar sincronizados: si el tipo de operación es 1001,
        // exigimos que también exista el bien/servicio, el % y el monto en
        // PaymentTerms, y la cuenta + método de pago completos en PaymentMeans.
        const isOperacionDetraccion = doc['cbc:InvoiceTypeCode']?._attributes?.listID === '1001'

        if (isOperacionDetraccion) {
        const detraccionTerm = doc['cac:PaymentTerms']?.find(
            (t: any) => t['cbc:ID']?._text === 'Detraccion'
        )
        const detraccionMean = doc['cac:PaymentMeans']?.find(
            (m: any) => m['cbc:ID']?._text === 'Detraccion'
        )
        const metodoPago = detraccionMean?.['cbc:PaymentMeansCode']?._text
        const cuenta = detraccionMean?.['cac:PayeeFinancialAccount']?.['cbc:ID']?._text
        const tipoBien = detraccionTerm?.['cbc:PaymentMeansID']?._text
        const monto = detraccionTerm?.['cbc:Amount']?._text

        if (isEmpty(tipoBien) && !monto) {
            errors.push({
                field: 'detraccion',
                message: 'Selecciona el bien/servicio o ingresa el monto de la detracción'
            })
        }

        if (isEmpty(metodoPago) || isEmpty(cuenta)) {
            errors.push({
                field: 'detraccion',
                message: 'Completa la cuenta y el método de pago de la detracción'
            })
        }
        }
    }

    // Para notas de crédito/débito, la descripción de la razón es obligatoria
    if (isNote && isEmpty(doc['cac:DiscrepancyResponse']?.['cbc:Description']?._text)) {
        errors.push({
            field: 'noteDescription',
            message: 'Agrega la razón de la nota crédito/débito'
        })
    }
    // para notas ver que al menos exista un doc de referencia
    if(isNote && !doc['cac:BillingReference']){
        errors.push({
            field: 'referenceDocument',
            message: 'Agrega al menos un documento que va modificar'
        })
    }

    // Validaciones específicas para Guías de Remisión (09 y 31)
    if (isGuia) {
        // Validar peso bruto
        const grossWeight = doc['cac:Shipment']?.['cbc:GrossWeightMeasure']?._text
        if (!grossWeight || parseFloat(grossWeight) <= 0) {
            errors.push({
                field: 'grossWeight',
                message: 'El peso bruto total es requerido'
            })
        }

        // Validar datos del transportista (solo en Transporte Público)
        const transportModeCode = doc['cac:Shipment']?.['cac:ShipmentStage']?.['cbc:TransportModeCode']?._text
        const isTransportePrivado = transportModeCode === '02'

        if (!isTransportePrivado) {
            const carrierParty = doc['cac:Shipment']?.['cac:ShipmentStage']?.['cac:CarrierParty']
            const carrierDocument = carrierParty?.['cac:PartyIdentification']?.['cbc:ID']?._text
            if (isEmpty(carrierDocument)) {
                errors.push({
                    field: 'carrierParty',
                    message: 'Los datos del transportista son requeridos'
                })
            }
        }

        // Validar destinatario
        const deliveryCustomer = doc['cac:DeliveryCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text
        if (isEmpty(deliveryCustomer)) {
            errors.push({
                field: 'deliveryCustomer',
                message: 'El destinatario es requerido'
            })
        }

        // Validar Punto de Partida (DespatchAddress)
        const despatchAddress = doc['cac:Shipment']?.['cac:Delivery']?.['cac:Despatch']?.['cac:DespatchAddress']
        const departureUbigeo = despatchAddress?.['cbc:ID']?._text
        const departureAddress = despatchAddress?.['cac:AddressLine']?.['cbc:Line']?._text

        if (isEmpty(departureUbigeo)) {
            errors.push({
                field: 'departure.ubigeo',
                message: 'Punto de Partida: Selecciona Departamento, Provincia y Distrito'
            })
        } else if (departureUbigeo.length !== 6) {
            errors.push({
                field: 'departure.ubigeo',
                message: 'Punto de Partida: El ubigeo debe estar completo'
            })
        }

        if (isEmpty(departureAddress)) {
            errors.push({
                field: 'departure.address',
                message: 'Punto de Partida: La dirección completa es requerida'
            })
        }

        // Validar Punto de Llegada (DeliveryAddress)
        const deliveryAddressObj = doc['cac:Shipment']?.['cac:Delivery']?.['cac:DeliveryAddress']
        const arrivalUbigeo = deliveryAddressObj?.['cbc:ID']?._text
        const arrivalAddress = deliveryAddressObj?.['cac:AddressLine']?.['cbc:Line']?._text

        if (isEmpty(arrivalUbigeo)) {
            errors.push({
                field: 'arrival.ubigeo',
                message: 'Punto de Llegada: Selecciona Departamento, Provincia y Distrito'
            })
        } else if (arrivalUbigeo.length !== 6) {
            errors.push({
                field: 'arrival.ubigeo',
                message: 'Punto de Llegada: El ubigeo debe estar completo'
            })
        }

        if (isEmpty(arrivalAddress)) {
            errors.push({
                field: 'arrival.address',
                message: 'Punto de Llegada: La dirección completa es requerida'
            })
        }

        // Validar vehículos y conductores si el indicador está presente O si es Transporte Privado
        const specialInstructions = doc['cac:Shipment']?.['cbc:SpecialInstructions']
        const hasIndicator = Array.isArray(specialInstructions) &&
            specialInstructions.length > 0 &&
            specialInstructions.some((instr: any) => instr._text === 'SUNAT_Envio_IndicadorVehiculoConductoresTransp')

        // Verificar si M1L está activo
        const hasM1LIndicator = Array.isArray(specialInstructions) &&
            specialInstructions.some((instr: any) => instr._text === 'SUNAT_Envio_IndicadorTrasladoVehiculoM1L')

        // Validar vehículos/conductores si: tiene indicador O es transporte privado (y M1L no está activo)
        const shouldValidateVehicles = (hasIndicator || isTransportePrivado) && !hasM1LIndicator

        if (shouldValidateVehicles) {
            // Validar vehículos
            const transportHandlingUnit = doc['cac:Shipment']?.['cac:TransportHandlingUnit']
            const vehicles = Array.isArray(transportHandlingUnit) ? transportHandlingUnit : (transportHandlingUnit ? [transportHandlingUnit] : [])

            if (vehicles.length === 0) {
                errors.push({
                    field: 'vehicles',
                    message: 'Agrega al menos un vehículo'
                })
            }

            vehicles.forEach((vehicle: any, index: number) => {
                const equipment = vehicle['cac:TransportEquipment']
                const plate = equipment?.['cbc:ID']?._text

                // Placa: obligatoria, 6-8 caracteres alfanuméricos
                if (isEmpty(plate)) {
                    errors.push({
                        field: 'vehicle.plate',
                        message: `Vehículo ${index + 1}: La placa es obligatoria`
                    })
                } else if (!/^[A-Z0-9]{6,8}$/.test(plate)) {
                    errors.push({
                        field: 'vehicle.plate',
                        message: `Vehículo ${index + 1}: La placa debe tener entre 6 y 8 caracteres alfanuméricos`
                    })
                }

                // TUC/CHV: opcional, 10-15 caracteres alfanuméricos (solo validar si no está vacío)
                const tucChv = equipment?.['cac:ApplicableTransportMeans']?.['cbc:RegistrationNationalityID']?._text
                if (tucChv && !/^[A-Z0-9]{10,15}$/.test(tucChv)) {
                    errors.push({
                        field: 'vehicle.tucChv',
                        message: `Vehículo ${index + 1}: TUC/CHV debe tener entre 10 y 15 caracteres alfanuméricos`
                    })
                }

                // Autorización: opcional, 3-50 caracteres alfanuméricos (solo validar si no está vacío)
                const authorization = equipment?.['cac:ShipmentDocumentReference']?.['cbc:ID']?._text
                if (authorization && !/^[A-Z0-9]{3,50}$/.test(authorization)) {
                    errors.push({
                        field: 'vehicle.authorization',
                        message: `Vehículo ${index + 1}: Autorización debe tener entre 3 y 50 caracteres alfanuméricos`
                    })
                }
            })

            // Validar conductores (solo si M1L NO está activo)
            if (!hasM1LIndicator) {
                const driverPersons = doc['cac:Shipment']?.['cac:ShipmentStage']?.['cac:DriverPerson']
                const drivers = Array.isArray(driverPersons) ? driverPersons : (driverPersons ? [driverPersons] : [])

                if (drivers.length === 0) {
                    errors.push({
                        field: 'drivers',
                        message: 'Agrega al menos un conductor'
                    })
                }

                drivers.forEach((driver: any, index: number) => {
                    // Licencia: obligatoria, 9-10 caracteres alfanuméricos
                    const license = driver?.['cac:IdentityDocumentReference']?.['cbc:ID']?._text
                    if (isEmpty(license)) {
                        errors.push({
                            field: 'driver.license',
                            message: `Conductor ${index + 1}: La licencia es obligatoria`
                        })
                    } else if (!/^[A-Z0-9]{9,10}$/.test(license)) {
                        errors.push({
                            field: 'driver.license',
                            message: `Conductor ${index + 1}: La licencia debe tener entre 9 y 10 caracteres alfanuméricos`
                        })
                    }

                    // Validar nombre y apellido
                    const firstName = driver?.['cbc:FirstName']?._text
                    const lastName = driver?.['cbc:FamilyName']?._text
                    if (isEmpty(firstName)) {
                        errors.push({
                            field: 'driver.firstName',
                            message: `Conductor ${index + 1}: El nombre es obligatorio`
                        })
                    }
                    if (isEmpty(lastName)) {
                        errors.push({
                            field: 'driver.lastName',
                            message: `Conductor ${index + 1}: El apellido es obligatorio`
                        })
                    }

                    // Validar tipo de conductor (Principal/Secundario)
                    const jobTitle = driver?.['cbc:JobTitle']?._text
                    if (isEmpty(jobTitle)) {
                        errors.push({
                            field: 'driver.jobTitle',
                            message: `Conductor ${index + 1}: El tipo de conductor es obligatorio`
                        })
                    }
                })
            }

            // Registro MTC: opcional, 0-20 caracteres alfanuméricos (solo en Transporte Público)
            if (!isTransportePrivado) {
                const carrierParty = doc['cac:Shipment']?.['cac:ShipmentStage']?.['cac:CarrierParty']
                const mtcRegistration = carrierParty?.['cac:PartyLegalEntity']?.['cbc:CompanyID']?._text
                if (mtcRegistration && !/^[A-Z0-9]{0,20}$/.test(mtcRegistration)) {
                    errors.push({
                        field: 'carrierParty.mtcRegistration',
                        message: 'Registro MTC debe tener máximo 20 caracteres alfanuméricos'
                    })
                }
            }
        }
    }

    return errors
}
