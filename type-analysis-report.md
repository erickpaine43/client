# Type Analysis Report

## Summary

- **Total Types**: 5787
- **Duplicated Types**: 0
- **Layer Conflicts**: 560

| Category | Count | Description |
|----------|-------|-------------|
| Backend/DB | 181 | Types related to database schemas, API responses, and backend data structures |
| Frontend/UI | 326 | Types for UI components, form data, and user interface state management |
| Shared/Common | 5280 | Common domain entities, validation schemas, and shared utility types |

## Type Categories

### Backend/DB (181 types)

Types related to database schemas, API responses, and backend data structures

| Type Name | File | Line |
|-----------|------|------|
| CredentialRequestOptions | lib.dom.d.ts | 467 |
| IdleRequestOptions | lib.dom.d.ts | 842 |
| PaymentRequestUpdateEventInit | lib.dom.d.ts | 1392 |
| PublicKeyCredentialEntity | lib.dom.d.ts | 1561 |
| PublicKeyCredentialRequestOptions | lib.dom.d.ts | 1570 |
| PublicKeyCredentialRequestOptionsJSON | lib.dom.d.ts | 1579 |
| PublicKeyCredentialRpEntity | lib.dom.d.ts | 1589 |
| PublicKeyCredentialUserEntity | lib.dom.d.ts | 1593 |
| PublicKeyCredentialUserEntityJSON | lib.dom.d.ts | 1598 |
| RequestInit | lib.dom.d.ts | 2039 |
| ResponseInit | lib.dom.d.ts | 2073 |
| AuthenticatorAssertionResponse | lib.dom.d.ts | 4033 |
| AuthenticatorAttestationResponse | lib.dom.d.ts | 4065 |
| AuthenticatorResponse | lib.dom.d.ts | 4109 |
| HTMLModElement | lib.dom.d.ts | 15737 |
| IDBOpenDBRequestEventMap | lib.dom.d.ts | 18387 |
| IDBOpenDBRequest | lib.dom.d.ts | 18397 |
| IDBRequestEventMap | lib.dom.d.ts | 18413 |
| IDBRequest | lib.dom.d.ts | 18423 |
| PaymentRequestEventMap | lib.dom.d.ts | 22859 |
| PaymentRequest | lib.dom.d.ts | 22871 |
| PaymentRequestUpdateEvent | lib.dom.d.ts | 22948 |
| PaymentResponseEventMap | lib.dom.d.ts | 22962 |
| PaymentResponse | lib.dom.d.ts | 22972 |
| ReadableStreamBYOBRequest | lib.dom.d.ts | 25885 |
| Request | lib.dom.d.ts | 26120 |
| Response | lib.dom.d.ts | 26316 |
| XMLHttpRequestEventMap | lib.dom.d.ts | 37122 |
| XMLHttpRequest | lib.dom.d.ts | 37131 |
| XMLHttpRequestEventTargetEventMap | lib.dom.d.ts | 37264 |
| XMLHttpRequestEventTarget | lib.dom.d.ts | 37279 |
| XMLHttpRequestUpload | lib.dom.d.ts | 37303 |
| FrameRequestCallback | lib.dom.d.ts | 38001 |
| IdleRequestCallback | lib.dom.d.ts | 38009 |
| VideoFrameRequestCallback | lib.dom.d.ts | 38121 |
| RequestInfo | lib.dom.d.ts | 39228 |
| XMLHttpRequestBodyInit | lib.dom.d.ts | 39235 |
| DistanceModelType | lib.dom.d.ts | 39286 |
| IDBRequestReadyState | lib.dom.d.ts | 39308 |
| PanningModelType | lib.dom.d.ts | 39345 |
| RequestCache | lib.dom.d.ts | 39391 |
| RequestCredentials | lib.dom.d.ts | 39392 |
| RequestDestination | lib.dom.d.ts | 39393 |
| RequestMode | lib.dom.d.ts | 39394 |
| RequestPriority | lib.dom.d.ts | 39395 |
| RequestRedirect | lib.dom.d.ts | 39396 |
| ResponseType | lib.dom.d.ts | 39400 |
| XMLHttpRequestResponseType | lib.dom.d.ts | 39429 |
| StandardSchemaV1 | standard-schema.d.cts | 2 |
| Identity | util.d.cts | 44 |
| SchemaClass | util.d.cts | 77 |
| $ZodStandardSchema | schemas.d.cts | 84 |
| OptionalOutSchema | schemas.d.cts | 533 |
| OptionalInSchema | schemas.d.cts | 538 |
| SchemaPartInternals | schemas.d.cts | 1010 |
| SchemaPart | schemas.d.cts | 1013 |
| JSONSchemaMeta | registries.d.cts | 24 |
| Schema | json-schema.d.cts | 1 |
| _JSONSchema | json-schema.d.cts | 2 |
| JSONSchema | json-schema.d.cts | 3 |
| BaseSchema | json-schema.d.cts | 67 |
| ObjectSchema | json-schema.d.cts | 68 |
| ArraySchema | json-schema.d.cts | 71 |
| StringSchema | json-schema.d.cts | 74 |
| NumberSchema | json-schema.d.cts | 77 |
| IntegerSchema | json-schema.d.cts | 80 |
| BooleanSchema | json-schema.d.cts | 83 |
| NullSchema | json-schema.d.cts | 86 |
| JSONSchemaGeneratorParams | to-json-schema.d.cts | 4 |
| JSONSchemaGenerator | to-json-schema.d.cts | 63 |
| ToJSONSchemaParams | to-json-schema.d.cts | 79 |
| RegistryToJSONSchemaParams | to-json-schema.d.cts | 81 |
| _ZodJSONSchema | schemas.d.cts | 656 |
| _ZodJSONSchemaInternals | schemas.d.cts | 664 |
| ZodJSONSchemaInternals | schemas.d.cts | 665 |
| ZodJSONSchema | schemas.d.cts | 669 |
| HTMLModElement | global.d.ts | 59 |
| CampaignResponse | campaign.ts | 57 |
| MailboxCreationRequest | mailbox.ts | 47 |
| LoginRequest | auth.ts | 274 |
| LoginResponse | auth.ts | 285 |
| RegisterRequest | auth.ts | 296 |
| PasswordResetRequest | auth.ts | 304 |
| ConfigSchema | index.d.ts | 22 |
| EntityId | index.d.ts | 1811 |
| EntityState | index.d.ts | 1830 |
| EntityAdapterOptions | index.d.ts | 1837 |
| DraftableEntityState | index.d.ts | 1842 |
| EntityStateAdapter | index.d.ts | 1846 |
| EntitySelectors | index.d.ts | 1874 |
| EntityStateFactory | index.d.ts | 1884 |
| EntityAdapter | index.d.ts | 1891 |
| EntityFilterProps | ui.ts | 200 |
| EntityFilterProps | analytics.ts | 597 |
| TeamMembersResponse | team.ts | 161 |
| TeamActivityResponse | team.ts | 173 |
| BaseEntity | common.ts | 16 |
| PaginatedResponse | common.ts | 27 |
| ApiResponse | common.ts | 35 |
| BaseEntity | base.ts | 9 |
| UserSettingsResponse | user.ts | 83 |
| BillingInfoResponse | billing.ts | 147 |
| SecuritySettingsEntity | security.ts | 27 |
| SecuritySettingsResponse | security.ts | 87 |
| NotificationPreferencesResponse | notifications.ts | 50 |
| TeamMembersResponse | team.ts | 37 |
| TeamMemberResponse | team.ts | 38 |
| DeleteTeamMemberResponse | team.ts | 39 |
| AppearanceSettingsEntity | appearance.ts | 33 |
| AppearanceSettingsResponse | appearance.ts | 60 |
| TrackingSettingsResponse | tracking.ts | 59 |
| ComplianceSettingsResponse | tracking.ts | 60 |
| WarmupResponse | accounts.ts | 84 |
| AdminUsersResponse | admin.ts | 76 |
| UsageLimitAlertsResponse | billing.ts | 134 |
| CompanyBillingResponse | billing.ts | 329 |
| PaymentMethodResponse | billing.ts | 330 |
| InvoiceResponse | billing.ts | 331 |
| SubscriptionPlanResponse | billing.ts | 332 |
| CompanyBillingListResponse | billing.ts | 334 |
| PaymentMethodListResponse | billing.ts | 335 |
| InvoiceListResponse | billing.ts | 336 |
| SubscriptionPlanListResponse | billing.ts | 337 |
| TSEntityName | index.d.ts | 1830 |
| ScaleIdentity | index.d.ts | 786 |
| FromSchema | indexed.d.ts | 31 |
| FromSchemaType | mapped.d.ts | 35 |
| SchemaOptions | schema.d.ts | 2 |
| TSchema | schema.d.ts | 23 |
| TAnySchema | anyschema.d.ts | 33 |
| RequestInfo | fetch.d.ts | 12 |
| RequestCache | fetch.d.ts | 91 |
| RequestCredentials | fetch.d.ts | 99 |
| RequestDestination | fetch.d.ts | 101 |
| RequestInit | fetch.d.ts | 121 |
| RequestMode | fetch.d.ts | 149 |
| RequestRedirect | fetch.d.ts | 151 |
| RequestDuplex | fetch.d.ts | 153 |
| Request | fetch.d.ts | 155 |
| ResponseInit | fetch.d.ts | 177 |
| ResponseType | fetch.d.ts | 183 |
| ResponseRedirectStatus | fetch.d.ts | 191 |
| Response | fetch.d.ts | 193 |
| _Request | globals.d.ts | 6 |
| _Response | globals.d.ts | 7 |
| _RequestInit | globals.d.ts | 11 |
| _ResponseInit | globals.d.ts | 13 |
| _ReadableStreamBYOBRequest | web.d.ts | 17 |
| EntityErrorProducer | decode.d.ts | 17 |
| EntityDecoder | decode.d.ts | 25 |
| JSONSchema4TypeName | index.d.ts | 8 |
| JSONSchema4Type | index.d.ts | 21 |
| JSONSchema4Object | index.d.ts | 30 |
| JSONSchema4Array | index.d.ts | 36 |
| JSONSchema4Version | index.d.ts | 51 |
| JSONSchema4 | index.d.ts | 57 |
| JSONSchema6TypeName | index.d.ts | 238 |
| JSONSchema6Type | index.d.ts | 248 |
| JSONSchema6Object | index.d.ts | 257 |
| JSONSchema6Array | index.d.ts | 263 |
| JSONSchema6Version | index.d.ts | 276 |
| JSONSchema6Definition | index.d.ts | 282 |
| JSONSchema6 | index.d.ts | 283 |
| JSONSchema7TypeName | index.d.ts | 560 |
| JSONSchema7Type | index.d.ts | 573 |
| JSONSchema7Object | index.d.ts | 582 |
| JSONSchema7Array | index.d.ts | 588 |
| JSONSchema7Version | index.d.ts | 601 |
| JSONSchema7Definition | index.d.ts | 607 |
| JSONSchema7 | index.d.ts | 608 |
| Request | index.d.ts | 8 |
| RequestInit | index.d.ts | 30 |
| RequestContext | index.d.ts | 48 |
| RequestMode | index.d.ts | 82 |
| RequestRedirect | index.d.ts | 83 |
| RequestCredentials | index.d.ts | 84 |
| RequestCache | index.d.ts | 86 |
| Response | index.d.ts | 159 |
| ResponseType | index.d.ts | 173 |
| ResponseInit | index.d.ts | 181 |
| RequestInfo | index.d.ts | 203 |

### Frontend/UI (326 types)

Types for UI components, form data, and user interface state management

| Type Name | File | Line |
|-----------|------|------|
| AuthenticationExtensionsClientInputs | lib.dom.d.ts | 201 |
| AuthenticationExtensionsClientInputsJSON | lib.dom.d.ts | 212 |
| AuthenticationExtensionsLargeBlobInputs | lib.dom.d.ts | 227 |
| AuthenticationExtensionsLargeBlobInputsJSON | lib.dom.d.ts | 233 |
| AuthenticationExtensionsPRFInputs | lib.dom.d.ts | 245 |
| AuthenticationExtensionsPRFInputsJSON | lib.dom.d.ts | 250 |
| CSSMatrixComponentOptions | lib.dom.d.ts | 299 |
| FormDataEventInit | lib.dom.d.ts | 741 |
| InputEventInit | lib.dom.d.ts | 893 |
| CSSMatrixComponent | lib.dom.d.ts | 5240 |
| CSSTransformComponent | lib.dom.d.ts | 7265 |
| FormData | lib.dom.d.ts | 12219 |
| FormDataEvent | lib.dom.d.ts | 12273 |
| GamepadButton | lib.dom.d.ts | 12400 |
| HTMLButtonElement | lib.dom.d.ts | 13262 |
| HTMLInputElement | lib.dom.d.ts | 14702 |
| InputDeviceInfo | lib.dom.d.ts | 18895 |
| InputEvent | lib.dom.d.ts | 18914 |
| MIDIInputEventMap | lib.dom.d.ts | 19486 |
| MIDIInput | lib.dom.d.ts | 19496 |
| MIDIInputMap | lib.dom.d.ts | 19516 |
| SVGComponentTransferFunctionElement | lib.dom.d.ts | 26967 |
| SVGFEComponentTransferElement | lib.dom.d.ts | 27261 |
| FormDataEntryValue | lib.dom.d.ts | 39187 |
| RTCIceComponent | lib.dom.d.ts | 39365 |
| FormDataIterator | lib.dom.iterable.d.ts | 149 |
| FormData | lib.dom.iterable.d.ts | 153 |
| MIDIInputMap | lib.dom.iterable.d.ts | 225 |
| $InferObjectInput | schemas.d.cts | 548 |
| $InferUnionInput | schemas.d.cts | 606 |
| $InferTupleInputType | schemas.d.cts | 661 |
| TupleInputTypeNoOptionals | schemas.d.cts | 665 |
| TupleInputTypeWithOptionals | schemas.d.cts | 668 |
| $InferZodRecordInput | schemas.d.cts | 700 |
| $InferEnumInput | schemas.d.cts | 744 |
| input | core.d.cts | 32 |
| $input | registries.d.cts | 6 |
| InputEvent | global.d.ts | 16 |
| HTMLButtonElement | global.d.ts | 41 |
| HTMLInputElement | global.d.ts | 58 |
| SVGFEComponentTransferElement | global.d.ts | 107 |
| FormData | global.d.ts | 155 |
| NativeInputEvent | index.d.ts | 14 |
| LucideProps | lucide-react.d.ts | 13 |
| IconComponentProps | lucide-react.d.ts | 24542 |
| RecipientsSettingsProps | campaign.ts | 17 |
| CampaignFormProps | campaign.ts | 193 |
| SequenceStepActionsProps | campaign.ts | 207 |
| SequenceStepProps | campaign.ts | 220 |
| ClientFormData | clients-leads.ts | 92 |
| LeadFormData | clients-leads.ts | 104 |
| SidebarMenuItemProps | nav-link.ts | 36 |
| MenuItemProps | nav-link.ts | 43 |
| VariantProps | index.d.ts | 18 |
| Props | index.d.ts | 34 |
| UseFieldArrayProps | fieldArray.d.ts | 5 |
| FieldArrayMethodProps | fieldArray.d.ts | 22 |
| UseFormProps | form.d.ts | 60 |
| FormStateProxy | form.d.ts | 79 |
| ReadFormState | form.d.ts | 88 |
| FormState | form.d.ts | 93 |
| UseFormGetFieldState | form.d.ts | 279 |
| FormStateSubjectRef | form.d.ts | 581 |
| UseFormStateProps | form.d.ts | 678 |
| UseFormStateReturn | form.d.ts | 684 |
| UseWatchProps | form.d.ts | 685 |
| FormProviderProps | form.d.ts | 693 |
| FormProps | form.d.ts | 696 |
| InputValidationRules | validator.d.ts | 40 |
| ControllerRenderProps | controller.d.ts | 11 |
| UseControllerProps | controller.d.ts | 19 |
| ControllerProps | controller.d.ts | 53 |
| SurfaceProps | Surface.d.ts | 6 |
| Props | Surface.d.ts | 21 |
| LayerProps | Layer.d.ts | 3 |
| Props | Layer.d.ts | 7 |
| DotProps | Dot.d.ts | 6 |
| Props | Dot.d.ts | 13 |
| Props | DefaultTooltipContent.d.ts | 29 |
| CartesianAxisProps | CartesianAxis.d.ts | 15 |
| Props | CartesianAxis.d.ts | 54 |
| BrushSettings | brushSlice.d.ts | 7 |
| ChartData | chartDataSlice.d.ts | 9 |
| AppliedChartData | chartDataSlice.d.ts | 17 |
| ChartDataState | chartDataSlice.d.ts | 20 |
| RectangleProps | Rectangle.d.ts | 8 |
| Props | Rectangle.d.ts | 21 |
| LabelProps | Label.d.ts | 9 |
| Props | Label.d.ts | 24 |
| BarRectangleProps | BarUtils.d.ts | 4 |
| LineSettings | LineSettings.d.ts | 4 |
| ScatterSettings | ScatterSettings.d.ts | 5 |
| CurveProps | Curve.d.ts | 25 |
| Props | Curve.d.ts | 35 |
| GetPathProps | Curve.d.ts | 36 |
| AreaPointItem | areaSelectors.d.ts | 8 |
| ComputedArea | areaSelectors.d.ts | 14 |
| AreaProps | Area.d.ts | 12 |
| AreaSvgProps | Area.d.ts | 43 |
| Props | Area.d.ts | 44 |
| AreaSettings | AreaSettings.d.ts | 6 |
| RadialBarSettings | RadialBarSettings.d.ts | 3 |
| PieSettings | PieSettings.d.ts | 4 |
| RadarSettings | RadarSettings.d.ts | 2 |
| GraphicalItemId | graphicalItemsSlice.d.ts | 16 |
| CartesianGraphicalItemType | graphicalItemsSlice.d.ts | 17 |
| PolarGraphicalItemType | graphicalItemsSlice.d.ts | 18 |
| GraphicalItemSettings | graphicalItemsSlice.d.ts | 19 |
| BaseCartesianGraphicalItemSettings | graphicalItemsSlice.d.ts | 40 |
| CartesianGraphicalItemSettings | graphicalItemsSlice.d.ts | 55 |
| BasePolarGraphicalItemSettings | graphicalItemsSlice.d.ts | 56 |
| PolarGraphicalItemSettings | graphicalItemsSlice.d.ts | 60 |
| GraphicalItemsState | graphicalItemsSlice.d.ts | 61 |
| ReplacePayload | graphicalItemsSlice.d.ts | 79 |
| MaybeStackedGraphicalItem | StackedGraphicalItem.d.ts | 8 |
| DefinitelyStackedGraphicalItem | StackedGraphicalItem.d.ts | 20 |
| BarSettings | BarSettings.d.ts | 4 |
| BarProps | Bar.d.ts | 28 |
| BarSvgProps | Bar.d.ts | 63 |
| Props | Bar.d.ts | 64 |
| LineProps | Line.d.ts | 20 |
| LineSvgProps | Line.d.ts | 48 |
| Props | Line.d.ts | 49 |
| LabelListProps | LabelList.d.ts | 10 |
| Props | LabelList.d.ts | 23 |
| SymbolsProps | Symbols.d.ts | 17 |
| ScatterProps | Scatter.d.ts | 30 |
| BaseScatterSvgProps | Scatter.d.ts | 55 |
| Props | Scatter.d.ts | 56 |
| ErrorBarDataPointFormatter | ErrorBar.d.ts | 26 |
| ErrorBarProps | ErrorBar.d.ts | 30 |
| Props | ErrorBar.d.ts | 44 |
| ErrorBarsSettings | errorBarSlice.d.ts | 9 |
| ErrorBarsState | errorBarSlice.d.ts | 21 |
| LegendSettings | legendSlice.d.ts | 4 |
| LegendState | legendSlice.d.ts | 17 |
| ChartOptions | optionsSlice.d.ts | 13 |
| RadiusAxisSettings | polarAxisSlice.d.ts | 2 |
| AngleAxisSettings | polarAxisSlice.d.ts | 3 |
| PolarAxisState | polarAxisSlice.d.ts | 4 |
| PolarChartOptions | polarOptionsSlice.d.ts | 1 |
| ReferenceElementSettings | referenceElementsSlice.d.ts | 5 |
| ReferenceDotSettings | referenceElementsSlice.d.ts | 10 |
| ReferenceAreaSettings | referenceElementsSlice.d.ts | 15 |
| ReferenceLineSettings | referenceElementsSlice.d.ts | 21 |
| ReferenceElementState | referenceElementsSlice.d.ts | 25 |
| UpdatableChartOptions | rootPropsSlice.d.ts | 7 |
| RechartsRootState | store.d.ts | 39 |
| AppDispatch | store.d.ts | 40 |
| GetTicksInput | getTicks.d.ts | 4 |
| GridLineTypeFunctionProps | CartesianGrid.d.ts | 13 |
| AxisPropsForCartesianGridTicksGeneration | CartesianGrid.d.ts | 17 |
| InternalCartesianGridProps | CartesianGrid.d.ts | 31 |
| CartesianGridProps | CartesianGrid.d.ts | 37 |
| AcceptedSvgProps | CartesianGrid.d.ts | 105 |
| Props | CartesianGrid.d.ts | 106 |
| LineItemProps | CartesianGrid.d.ts | 107 |
| DisplayedStackedDataPoint | combineDisplayedStackedData.d.ts | 15 |
| DisplayedStackedData | combineDisplayedStackedData.d.ts | 16 |
| XorYorZType | axisSelectors.d.ts | 17 |
| XorYType | axisSelectors.d.ts | 22 |
| AxisWithTicksSettings | axisSelectors.d.ts | 23 |
| AppliedChartDataWithErrorDomain | axisSelectors.d.ts | 93 |
| ErrorValue | axisSelectors.d.ts | 115 |
| AxisRange | axisSelectors.d.ts | 282 |
| AxisOffsetSteps | axisSelectors.d.ts | 344 |
| BaseAxisWithScale | axisSelectors.d.ts | 415 |
| ZAxisWithScale | axisSelectors.d.ts | 419 |
| AxisDirection | axisSelectors.d.ts | 481 |
| AxisId | cartesianAxisSlice.d.ts | 6 |
| XAxisPadding | cartesianAxisSlice.d.ts | 7 |
| YAxisPadding | cartesianAxisSlice.d.ts | 11 |
| XAxisOrientation | cartesianAxisSlice.d.ts | 15 |
| YAxisOrientation | cartesianAxisSlice.d.ts | 16 |
| BaseCartesianAxis | cartesianAxisSlice.d.ts | 20 |
| TicksSettings | cartesianAxisSlice.d.ts | 39 |
| CartesianAxisSettings | cartesianAxisSlice.d.ts | 55 |
| XAxisSettings | cartesianAxisSlice.d.ts | 63 |
| YAxisWidth | cartesianAxisSlice.d.ts | 68 |
| YAxisSettings | cartesianAxisSlice.d.ts | 69 |
| ZAxisSettings | cartesianAxisSlice.d.ts | 78 |
| AxisMapState | cartesianAxisSlice.d.ts | 81 |
| TooltipPayloadEntry | tooltipSlice.d.ts | 8 |
| TooltipEntrySettings | tooltipSlice.d.ts | 18 |
| TooltipPayload | tooltipSlice.d.ts | 24 |
| TooltipIndex | tooltipSlice.d.ts | 32 |
| TooltipPayloadSearcher | tooltipSlice.d.ts | 38 |
| TooltipPayloadConfiguration | tooltipSlice.d.ts | 39 |
| ActiveTooltipProps | tooltipSlice.d.ts | 56 |
| SharedTooltipSettings | tooltipSlice.d.ts | 72 |
| TooltipSettingsState | tooltipSlice.d.ts | 73 |
| TooltipInteractionState | tooltipSlice.d.ts | 100 |
| TooltipSyncState | tooltipSlice.d.ts | 137 |
| TooltipState | tooltipSlice.d.ts | 154 |
| TooltipActionPayload | tooltipSlice.d.ts | 198 |
| AxisPropsNeededForTicksGenerator | ChartUtils.d.ts | 56 |
| PresentationAttributesWithProps | types.d.ts | 31 |
| DOMAttributesWithProps | types.d.ts | 91 |
| BaseAxisProps | types.d.ts | 520 |
| ActiveDotProps | types.d.ts | 668 |
| CartesianChartProps | types.d.ts | 731 |
| PolarChartProps | types.d.ts | 758 |
| InternalProps | DefaultLegendContent.d.ts | 29 |
| Props | DefaultLegendContent.d.ts | 47 |
| Props | Legend.d.ts | 8 |
| CursorProps | Cursor.d.ts | 11 |
| CursorConnectedProps | Cursor.d.ts | 18 |
| TooltipContentProps | Tooltip.d.ts | 11 |
| TooltipProps | Tooltip.d.ts | 19 |
| Props | ResponsiveContainer.d.ts | 3 |
| Props | Cell.d.ts | 5 |
| TextProps | Text.d.ts | 4 |
| Props | Text.d.ts | 15 |
| GetWordsByLinesProps | Text.d.ts | 20 |
| Props | Customized.d.ts | 7 |
| SectorProps | Sector.d.ts | 4 |
| Props | Sector.d.ts | 11 |
| PolygonProps | Polygon.d.ts | 7 |
| Props | Polygon.d.ts | 13 |
| CrossProps | Cross.d.ts | 6 |
| Props | Cross.d.ts | 15 |
| PolarGridProps | PolarGrid.d.ts | 4 |
| Props | PolarGrid.d.ts | 16 |
| PolarRadiusAxisProps | PolarRadiusAxis.d.ts | 5 |
| AxisSvgProps | PolarRadiusAxis.d.ts | 14 |
| Props | PolarRadiusAxis.d.ts | 15 |
| PropsInjectedFromRedux | PolarAngleAxis.d.ts | 9 |
| PolarAngleAxisProps | PolarAngleAxis.d.ts | 14 |
| AxisSvgProps | PolarAngleAxis.d.ts | 33 |
| Props | PolarAngleAxis.d.ts | 34 |
| TickItemTextProps | PolarAngleAxis.d.ts | 35 |
| PieLabelProps | Pie.d.ts | 24 |
| PieProps | Pie.d.ts | 43 |
| PieLabelRenderProps | Pie.d.ts | 76 |
| Props | Pie.d.ts | 87 |
| RadarProps | Radar.d.ts | 18 |
| Props | Radar.d.ts | 53 |
| InternalRadialBarProps | RadialBar.d.ts | 17 |
| RadialBarProps | RadialBar.d.ts | 49 |
| BrushProps | Brush.d.ts | 7 |
| Props | Brush.d.ts | 29 |
| TravellerProps | Brush.d.ts | 30 |
| XAxisProps | XAxis.d.ts | 8 |
| Props | XAxis.d.ts | 28 |
| YAxisProps | YAxis.d.ts | 5 |
| Props | YAxis.d.ts | 28 |
| InternalReferenceLineProps | ReferenceLine.d.ts | 12 |
| ReferenceLineProps | ReferenceLine.d.ts | 23 |
| Props | ReferenceLine.d.ts | 41 |
| EndPointsPropsSubset | ReferenceLine.d.ts | 42 |
| ReferenceDotProps | ReferenceDot.d.ts | 6 |
| Props | ReferenceDot.d.ts | 22 |
| ReferenceAreaProps | ReferenceArea.d.ts | 6 |
| Props | ReferenceArea.d.ts | 18 |
| Props | ZAxis.d.ts | 6 |
| Props | Treemap.d.ts | 38 |
| NodeProps | Sankey.d.ts | 12 |
| LinkProps | Sankey.d.ts | 20 |
| SankeyProps | Sankey.d.ts | 42 |
| Props | Sankey.d.ts | 63 |
| SunburstChartProps | SunburstChart.d.ts | 21 |
| TrapezoidProps | Trapezoid.d.ts | 7 |
| Props | Trapezoid.d.ts | 19 |
| InternalFunnelProps | Funnel.d.ts | 15 |
| FunnelProps | Funnel.d.ts | 39 |
| FunnelSvgProps | Funnel.d.ts | 60 |
| InternalProps | Funnel.d.ts | 61 |
| Props | Funnel.d.ts | 62 |
| MetricToggleProps | ui.ts | 163 |
| DateRangePickerProps | ui.ts | 175 |
| CampaignPerformanceData | analytics.ts | 209 |
| MetricToggleProps | analytics.ts | 560 |
| DateRangeFilterProps | analytics.ts | 572 |
| ButtonVariants | ui.ts | 5 |
| ButtonVariant | ui.ts | 8 |
| ButtonSize | ui.ts | 15 |
| InputProps | ui.ts | 32 |
| ChartContainerProps | ui.ts | 46 |
| ChartTooltipContentProps | ui.ts | 54 |
| ChartLegendContentProps | ui.ts | 67 |
| TableProps | ui.ts | 75 |
| TableHeaderProps | ui.ts | 76 |
| TableBodyProps | ui.ts | 77 |
| TableFooterProps | ui.ts | 78 |
| TableRowProps | ui.ts | 79 |
| TableHeadProps | ui.ts | 80 |
| TableCellProps | ui.ts | 81 |
| TableCaptionProps | ui.ts | 82 |
| CardProps | ui.ts | 85 |
| CardHeaderProps | ui.ts | 86 |
| CardTitleProps | ui.ts | 87 |
| CardDescriptionProps | ui.ts | 88 |
| CardActionProps | ui.ts | 89 |
| CardContentProps | ui.ts | 90 |
| CardFooterProps | ui.ts | 91 |
| DashboardLayoutProps | ui.ts | 94 |
| CampaignPerformanceChartProps | ui.ts | 99 |
| EmailStatusPieChartProps | ui.ts | 108 |
| CustomTooltipProps | ui.ts | 112 |
| LexicalEditorProps | ui.ts | 122 |
| ComponentBaseProps | common.ts | 54 |
| UserSettingsProps | user.ts | 89 |
| BillingSettingsProps | billing.ts | 153 |
| PasswordToggleProps | security.ts | 93 |
| PasswordStrengthIndicatorProps | security.ts | 98 |
| NotificationToggleProps | notifications.ts | 56 |
| NotificationSettingsProps | notifications.ts | 62 |
| NotificationSettingsComponentProps | notifications.ts | 76 |
| TeamSettingsProps | team.ts | 45 |
| CompanyBillingFormData | billing.ts | 305 |
| PaymentMethodFormData | billing.ts | 323 |
| CampaignFormProps | campaigns.ts | 13 |
| SequenceStepActionsProps | campaigns.ts | 27 |
| EmailSecuenceSettingsProps | campaigns.ts | 40 |
| SequenceStepProps | campaigns.ts | 51 |
| ScheduleSettingsProps | campaigns.ts | 74 |
| DomainAuthStatusProps | forms.ts | 217 |
| EmailAccountFormProps | forms.ts | 224 |
| ContactFormData | forms.ts | 268 |
| IconProps | toolbar.ts | 26 |
| InputSourceMap | index.d.ts | 19 |
| FormDataEntryValue | formdata.d.ts | 10 |
| FormData | formdata.d.ts | 15 |
| _FormData | globals.d.ts | 8 |
| FormData | index.d.ts | 30 |
| InputBuffer | index.d.ts | 6 |

### Shared/Common (5280 types)

Common domain entities, validation schemas, and shared utility types

| Type Name | File | Line |
|-----------|------|------|
| Symbol | lib.es5.d.ts | 100 |
| PropertyKey | lib.es5.d.ts | 108 |
| PropertyDescriptor | lib.es5.d.ts | 110 |
| PropertyDescriptorMap | lib.es5.d.ts | 119 |
| Object | lib.es5.d.ts | 123 |
| ObjectConstructor | lib.es5.d.ts | 155 |
| Function | lib.es5.d.ts | 275 |
| FunctionConstructor | lib.es5.d.ts | 309 |
| ThisParameterType | lib.es5.d.ts | 324 |
| OmitThisParameter | lib.es5.d.ts | 329 |
| CallableFunction | lib.es5.d.ts | 331 |
| NewableFunction | lib.es5.d.ts | 368 |
| IArguments | lib.es5.d.ts | 404 |
| String | lib.es5.d.ts | 410 |
| StringConstructor | lib.es5.d.ts | 534 |
| Boolean | lib.es5.d.ts | 546 |
| BooleanConstructor | lib.es5.d.ts | 551 |
| Number | lib.es5.d.ts | 559 |
| NumberConstructor | lib.es5.d.ts | 588 |
| TemplateStringsArray | lib.es5.d.ts | 621 |
| ImportMeta | lib.es5.d.ts | 631 |
| ImportCallOptions | lib.es5.d.ts | 640 |
| ImportAssertions | lib.es5.d.ts | 649 |
| ImportAttributes | lib.es5.d.ts | 656 |
| Math | lib.es5.d.ts | 660 |
| Date | lib.es5.d.ts | 772 |
| DateConstructor | lib.es5.d.ts | 925 |
| RegExpMatchArray | lib.es5.d.ts | 963 |
| RegExpExecArray | lib.es5.d.ts | 978 |
| RegExp | lib.es5.d.ts | 993 |
| RegExpConstructor | lib.es5.d.ts | 1025 |
| Error | lib.es5.d.ts | 1075 |
| ErrorConstructor | lib.es5.d.ts | 1081 |
| EvalError | lib.es5.d.ts | 1089 |
| EvalErrorConstructor | lib.es5.d.ts | 1092 |
| RangeError | lib.es5.d.ts | 1100 |
| RangeErrorConstructor | lib.es5.d.ts | 1103 |
| ReferenceError | lib.es5.d.ts | 1111 |
| ReferenceErrorConstructor | lib.es5.d.ts | 1114 |
| SyntaxError | lib.es5.d.ts | 1122 |
| SyntaxErrorConstructor | lib.es5.d.ts | 1125 |
| TypeError | lib.es5.d.ts | 1133 |
| TypeErrorConstructor | lib.es5.d.ts | 1136 |
| URIError | lib.es5.d.ts | 1144 |
| URIErrorConstructor | lib.es5.d.ts | 1147 |
| JSON | lib.es5.d.ts | 1155 |
| ReadonlyArray | lib.es5.d.ts | 1191 |
| ConcatArray | lib.es5.d.ts | 1318 |
| Array | lib.es5.d.ts | 1325 |
| ArrayConstructor | lib.es5.d.ts | 1513 |
| TypedPropertyDescriptor | lib.es5.d.ts | 1526 |
| PromiseConstructorLike | lib.es5.d.ts | 1535 |
| PromiseLike | lib.es5.d.ts | 1537 |
| Promise | lib.es5.d.ts | 1550 |
| Awaited | lib.es5.d.ts | 1570 |
| ArrayLike | lib.es5.d.ts | 1577 |
| Partial | lib.es5.d.ts | 1585 |
| Required | lib.es5.d.ts | 1592 |
| Readonly | lib.es5.d.ts | 1599 |
| Pick | lib.es5.d.ts | 1606 |
| Record | lib.es5.d.ts | 1613 |
| Exclude | lib.es5.d.ts | 1620 |
| Extract | lib.es5.d.ts | 1625 |
| Omit | lib.es5.d.ts | 1630 |
| NonNullable | lib.es5.d.ts | 1635 |
| Parameters | lib.es5.d.ts | 1640 |
| ConstructorParameters | lib.es5.d.ts | 1645 |
| ReturnType | lib.es5.d.ts | 1650 |
| InstanceType | lib.es5.d.ts | 1655 |
| Uppercase | lib.es5.d.ts | 1660 |
| Lowercase | lib.es5.d.ts | 1665 |
| Capitalize | lib.es5.d.ts | 1670 |
| Uncapitalize | lib.es5.d.ts | 1675 |
| NoInfer | lib.es5.d.ts | 1680 |
| ThisType | lib.es5.d.ts | 1685 |
| WeakKeyTypes | lib.es5.d.ts | 1690 |
| WeakKey | lib.es5.d.ts | 1694 |
| ArrayBuffer | lib.es5.d.ts | 1702 |
| ArrayBufferTypes | lib.es5.d.ts | 1717 |
| ArrayBufferLike | lib.es5.d.ts | 1720 |
| ArrayBufferConstructor | lib.es5.d.ts | 1722 |
| ArrayBufferView | lib.es5.d.ts | 1729 |
| DataView | lib.es5.d.ts | 1746 |
| DataViewConstructor | lib.es5.d.ts | 1873 |
| Int8Array | lib.es5.d.ts | 1883 |
| Int8ArrayConstructor | lib.es5.d.ts | 2126 |
| Uint8Array | lib.es5.d.ts | 2165 |
| Uint8ArrayConstructor | lib.es5.d.ts | 2408 |
| Uint8ClampedArray | lib.es5.d.ts | 2447 |
| Uint8ClampedArrayConstructor | lib.es5.d.ts | 2690 |
| Int16Array | lib.es5.d.ts | 2729 |
| Int16ArrayConstructor | lib.es5.d.ts | 2971 |
| Uint16Array | lib.es5.d.ts | 3010 |
| Uint16ArrayConstructor | lib.es5.d.ts | 3253 |
| Int32Array | lib.es5.d.ts | 3291 |
| Int32ArrayConstructor | lib.es5.d.ts | 3534 |
| Uint32Array | lib.es5.d.ts | 3573 |
| Uint32ArrayConstructor | lib.es5.d.ts | 3815 |
| Float32Array | lib.es5.d.ts | 3854 |
| Float32ArrayConstructor | lib.es5.d.ts | 4097 |
| Float64Array | lib.es5.d.ts | 4136 |
| Float64ArrayConstructor | lib.es5.d.ts | 4379 |
| String | lib.es5.d.ts | 4562 |
| Number | lib.es5.d.ts | 4572 |
| Date | lib.es5.d.ts | 4581 |
| AddEventListenerOptions | lib.dom.d.ts | 23 |
| AddressErrors | lib.dom.d.ts | 29 |
| AesCbcParams | lib.dom.d.ts | 42 |
| AesCtrParams | lib.dom.d.ts | 46 |
| AesDerivedKeyParams | lib.dom.d.ts | 51 |
| AesGcmParams | lib.dom.d.ts | 55 |
| AesKeyAlgorithm | lib.dom.d.ts | 61 |
| AesKeyGenParams | lib.dom.d.ts | 65 |
| Algorithm | lib.dom.d.ts | 69 |
| AnalyserOptions | lib.dom.d.ts | 73 |
| AnimationEventInit | lib.dom.d.ts | 80 |
| AnimationPlaybackEventInit | lib.dom.d.ts | 86 |
| AssignedNodesOptions | lib.dom.d.ts | 91 |
| AudioBufferOptions | lib.dom.d.ts | 95 |
| AudioBufferSourceOptions | lib.dom.d.ts | 101 |
| AudioConfiguration | lib.dom.d.ts | 110 |
| AudioContextOptions | lib.dom.d.ts | 118 |
| AudioDataCopyToOptions | lib.dom.d.ts | 123 |
| AudioDataInit | lib.dom.d.ts | 130 |
| AudioDecoderConfig | lib.dom.d.ts | 140 |
| AudioDecoderInit | lib.dom.d.ts | 147 |
| AudioDecoderSupport | lib.dom.d.ts | 152 |
| AudioEncoderConfig | lib.dom.d.ts | 157 |
| AudioEncoderInit | lib.dom.d.ts | 166 |
| AudioEncoderSupport | lib.dom.d.ts | 171 |
| AudioNodeOptions | lib.dom.d.ts | 176 |
| AudioProcessingEventInit | lib.dom.d.ts | 182 |
| AudioTimestamp | lib.dom.d.ts | 188 |
| AudioWorkletNodeOptions | lib.dom.d.ts | 193 |
| AuthenticationExtensionsClientOutputs | lib.dom.d.ts | 219 |
| AuthenticationExtensionsLargeBlobOutputs | lib.dom.d.ts | 239 |
| AuthenticationExtensionsPRFOutputs | lib.dom.d.ts | 255 |
| AuthenticationExtensionsPRFValues | lib.dom.d.ts | 260 |
| AuthenticationExtensionsPRFValuesJSON | lib.dom.d.ts | 265 |
| AuthenticatorSelectionCriteria | lib.dom.d.ts | 270 |
| AvcEncoderConfig | lib.dom.d.ts | 277 |
| BiquadFilterOptions | lib.dom.d.ts | 281 |
| BlobEventInit | lib.dom.d.ts | 289 |
| BlobPropertyBag | lib.dom.d.ts | 294 |
| CSSNumericType | lib.dom.d.ts | 303 |
| CSSStyleSheetInit | lib.dom.d.ts | 314 |
| CacheQueryOptions | lib.dom.d.ts | 320 |
| CanvasRenderingContext2DSettings | lib.dom.d.ts | 326 |
| CaretPositionFromPointOptions | lib.dom.d.ts | 333 |
| ChannelMergerOptions | lib.dom.d.ts | 337 |
| ChannelSplitterOptions | lib.dom.d.ts | 341 |
| CheckVisibilityOptions | lib.dom.d.ts | 345 |
| ClientQueryOptions | lib.dom.d.ts | 353 |
| ClipboardEventInit | lib.dom.d.ts | 358 |
| ClipboardItemOptions | lib.dom.d.ts | 362 |
| CloseEventInit | lib.dom.d.ts | 366 |
| CompositionEventInit | lib.dom.d.ts | 372 |
| ComputedEffectTiming | lib.dom.d.ts | 376 |
| ComputedKeyframe | lib.dom.d.ts | 385 |
| ConstantSourceOptions | lib.dom.d.ts | 393 |
| ConstrainBooleanParameters | lib.dom.d.ts | 397 |
| ConstrainDOMStringParameters | lib.dom.d.ts | 402 |
| ConstrainDoubleRange | lib.dom.d.ts | 407 |
| ConstrainULongRange | lib.dom.d.ts | 412 |
| ContentVisibilityAutoStateChangeEventInit | lib.dom.d.ts | 417 |
| ConvolverOptions | lib.dom.d.ts | 421 |
| CookieChangeEventInit | lib.dom.d.ts | 426 |
| CookieInit | lib.dom.d.ts | 431 |
| CookieListItem | lib.dom.d.ts | 441 |
| CookieStoreDeleteOptions | lib.dom.d.ts | 446 |
| CookieStoreGetOptions | lib.dom.d.ts | 453 |
| CredentialCreationOptions | lib.dom.d.ts | 458 |
| CredentialPropertiesOutput | lib.dom.d.ts | 463 |
| CryptoKeyPair | lib.dom.d.ts | 473 |
| CustomEventInit | lib.dom.d.ts | 478 |
| DOMMatrix2DInit | lib.dom.d.ts | 482 |
| DOMMatrixInit | lib.dom.d.ts | 497 |
| DOMPointInit | lib.dom.d.ts | 511 |
| DOMQuadInit | lib.dom.d.ts | 518 |
| DOMRectInit | lib.dom.d.ts | 525 |
| DelayOptions | lib.dom.d.ts | 532 |
| DeviceMotionEventAccelerationInit | lib.dom.d.ts | 537 |
| DeviceMotionEventInit | lib.dom.d.ts | 543 |
| DeviceMotionEventRotationRateInit | lib.dom.d.ts | 550 |
| DeviceOrientationEventInit | lib.dom.d.ts | 556 |
| DisplayMediaStreamOptions | lib.dom.d.ts | 563 |
| DocumentTimelineOptions | lib.dom.d.ts | 568 |
| DoubleRange | lib.dom.d.ts | 572 |
| DragEventInit | lib.dom.d.ts | 577 |
| DynamicsCompressorOptions | lib.dom.d.ts | 581 |
| EcKeyAlgorithm | lib.dom.d.ts | 589 |
| EcKeyGenParams | lib.dom.d.ts | 593 |
| EcKeyImportParams | lib.dom.d.ts | 597 |
| EcdhKeyDeriveParams | lib.dom.d.ts | 601 |
| EcdsaParams | lib.dom.d.ts | 605 |
| EffectTiming | lib.dom.d.ts | 609 |
| ElementCreationOptions | lib.dom.d.ts | 621 |
| ElementDefinitionOptions | lib.dom.d.ts | 626 |
| EncodedAudioChunkInit | lib.dom.d.ts | 630 |
| EncodedAudioChunkMetadata | lib.dom.d.ts | 638 |
| EncodedVideoChunkInit | lib.dom.d.ts | 642 |
| EncodedVideoChunkMetadata | lib.dom.d.ts | 649 |
| ErrorEventInit | lib.dom.d.ts | 653 |
| EventInit | lib.dom.d.ts | 661 |
| EventListenerOptions | lib.dom.d.ts | 667 |
| EventModifierInit | lib.dom.d.ts | 671 |
| EventSourceInit | lib.dom.d.ts | 688 |
| FilePropertyBag | lib.dom.d.ts | 692 |
| FileSystemCreateWritableOptions | lib.dom.d.ts | 696 |
| FileSystemFlags | lib.dom.d.ts | 700 |
| FileSystemGetDirectoryOptions | lib.dom.d.ts | 705 |
| FileSystemGetFileOptions | lib.dom.d.ts | 709 |
| FileSystemRemoveOptions | lib.dom.d.ts | 713 |
| FocusEventInit | lib.dom.d.ts | 717 |
| FocusOptions | lib.dom.d.ts | 721 |
| FontFaceDescriptors | lib.dom.d.ts | 725 |
| FontFaceSetLoadEventInit | lib.dom.d.ts | 737 |
| FullscreenOptions | lib.dom.d.ts | 745 |
| GainOptions | lib.dom.d.ts | 749 |
| GamepadEffectParameters | lib.dom.d.ts | 753 |
| GamepadEventInit | lib.dom.d.ts | 762 |
| GetAnimationsOptions | lib.dom.d.ts | 766 |
| GetComposedRangesOptions | lib.dom.d.ts | 770 |
| GetHTMLOptions | lib.dom.d.ts | 774 |
| GetNotificationOptions | lib.dom.d.ts | 779 |
| GetRootNodeOptions | lib.dom.d.ts | 783 |
| HashChangeEventInit | lib.dom.d.ts | 787 |
| HkdfParams | lib.dom.d.ts | 792 |
| HmacImportParams | lib.dom.d.ts | 798 |
| HmacKeyAlgorithm | lib.dom.d.ts | 803 |
| HmacKeyGenParams | lib.dom.d.ts | 808 |
| IDBDatabaseInfo | lib.dom.d.ts | 813 |
| IDBIndexParameters | lib.dom.d.ts | 818 |
| IDBObjectStoreParameters | lib.dom.d.ts | 823 |
| IDBTransactionOptions | lib.dom.d.ts | 828 |
| IDBVersionChangeEventInit | lib.dom.d.ts | 832 |
| IIRFilterOptions | lib.dom.d.ts | 837 |
| ImageBitmapOptions | lib.dom.d.ts | 846 |
| ImageBitmapRenderingContextSettings | lib.dom.d.ts | 855 |
| ImageDataSettings | lib.dom.d.ts | 859 |
| ImageDecodeOptions | lib.dom.d.ts | 863 |
| ImageDecodeResult | lib.dom.d.ts | 868 |
| ImageDecoderInit | lib.dom.d.ts | 873 |
| ImageEncodeOptions | lib.dom.d.ts | 883 |
| ImportNodeOptions | lib.dom.d.ts | 888 |
| IntersectionObserverInit | lib.dom.d.ts | 901 |
| JsonWebKey | lib.dom.d.ts | 907 |
| KeyAlgorithm | lib.dom.d.ts | 928 |
| KeySystemTrackConfiguration | lib.dom.d.ts | 932 |
| KeyboardEventInit | lib.dom.d.ts | 936 |
| Keyframe | lib.dom.d.ts | 948 |
| KeyframeAnimationOptions | lib.dom.d.ts | 955 |
| KeyframeEffectOptions | lib.dom.d.ts | 960 |
| LockInfo | lib.dom.d.ts | 966 |
| LockManagerSnapshot | lib.dom.d.ts | 972 |
| LockOptions | lib.dom.d.ts | 977 |
| MIDIConnectionEventInit | lib.dom.d.ts | 984 |
| MIDIMessageEventInit | lib.dom.d.ts | 988 |
| MIDIOptions | lib.dom.d.ts | 992 |
| MediaCapabilitiesDecodingInfo | lib.dom.d.ts | 997 |
| MediaCapabilitiesEncodingInfo | lib.dom.d.ts | 1001 |
| MediaCapabilitiesInfo | lib.dom.d.ts | 1004 |
| MediaCapabilitiesKeySystemConfiguration | lib.dom.d.ts | 1010 |
| MediaConfiguration | lib.dom.d.ts | 1020 |
| MediaDecodingConfiguration | lib.dom.d.ts | 1025 |
| MediaElementAudioSourceOptions | lib.dom.d.ts | 1030 |
| MediaEncodingConfiguration | lib.dom.d.ts | 1034 |
| MediaEncryptedEventInit | lib.dom.d.ts | 1038 |
| MediaImage | lib.dom.d.ts | 1043 |
| MediaKeyMessageEventInit | lib.dom.d.ts | 1049 |
| MediaKeySystemConfiguration | lib.dom.d.ts | 1054 |
| MediaKeySystemMediaCapability | lib.dom.d.ts | 1064 |
| MediaKeysPolicy | lib.dom.d.ts | 1070 |
| MediaMetadataInit | lib.dom.d.ts | 1074 |
| MediaPositionState | lib.dom.d.ts | 1081 |
| MediaQueryListEventInit | lib.dom.d.ts | 1087 |
| MediaRecorderOptions | lib.dom.d.ts | 1092 |
| MediaSessionActionDetails | lib.dom.d.ts | 1099 |
| MediaSettingsRange | lib.dom.d.ts | 1106 |
| MediaStreamAudioSourceOptions | lib.dom.d.ts | 1112 |
| MediaStreamConstraints | lib.dom.d.ts | 1116 |
| MediaStreamTrackEventInit | lib.dom.d.ts | 1123 |
| MediaTrackCapabilities | lib.dom.d.ts | 1127 |
| MediaTrackConstraintSet | lib.dom.d.ts | 1145 |
| MediaTrackConstraints | lib.dom.d.ts | 1163 |
| MediaTrackSettings | lib.dom.d.ts | 1167 |
| MediaTrackSupportedConstraints | lib.dom.d.ts | 1188 |
| MessageEventInit | lib.dom.d.ts | 1206 |
| MouseEventInit | lib.dom.d.ts | 1214 |
| MultiCacheQueryOptions | lib.dom.d.ts | 1226 |
| MutationObserverInit | lib.dom.d.ts | 1230 |
| NavigationPreloadState | lib.dom.d.ts | 1247 |
| NotificationOptions | lib.dom.d.ts | 1252 |
| OfflineAudioCompletionEventInit | lib.dom.d.ts | 1264 |
| OfflineAudioContextOptions | lib.dom.d.ts | 1268 |
| OptionalEffectTiming | lib.dom.d.ts | 1274 |
| OpusEncoderConfig | lib.dom.d.ts | 1286 |
| OscillatorOptions | lib.dom.d.ts | 1295 |
| PageRevealEventInit | lib.dom.d.ts | 1302 |
| PageSwapEventInit | lib.dom.d.ts | 1306 |
| PageTransitionEventInit | lib.dom.d.ts | 1311 |
| PannerOptions | lib.dom.d.ts | 1315 |
| PayerErrors | lib.dom.d.ts | 1332 |
| PaymentCurrencyAmount | lib.dom.d.ts | 1338 |
| PaymentDetailsBase | lib.dom.d.ts | 1343 |
| PaymentDetailsInit | lib.dom.d.ts | 1349 |
| PaymentDetailsModifier | lib.dom.d.ts | 1354 |
| PaymentDetailsUpdate | lib.dom.d.ts | 1361 |
| PaymentItem | lib.dom.d.ts | 1368 |
| PaymentMethodChangeEventInit | lib.dom.d.ts | 1374 |
| PaymentMethodData | lib.dom.d.ts | 1379 |
| PaymentOptions | lib.dom.d.ts | 1384 |
| PaymentShippingOption | lib.dom.d.ts | 1395 |
| PaymentValidationErrors | lib.dom.d.ts | 1402 |
| Pbkdf2Params | lib.dom.d.ts | 1408 |
| PerformanceMarkOptions | lib.dom.d.ts | 1414 |
| PerformanceMeasureOptions | lib.dom.d.ts | 1419 |
| PerformanceObserverInit | lib.dom.d.ts | 1426 |
| PeriodicWaveConstraints | lib.dom.d.ts | 1432 |
| PeriodicWaveOptions | lib.dom.d.ts | 1436 |
| PermissionDescriptor | lib.dom.d.ts | 1441 |
| PhotoCapabilities | lib.dom.d.ts | 1445 |
| PhotoSettings | lib.dom.d.ts | 1452 |
| PictureInPictureEventInit | lib.dom.d.ts | 1459 |
| PlaneLayout | lib.dom.d.ts | 1463 |
| PointerEventInit | lib.dom.d.ts | 1468 |
| PointerLockOptions | lib.dom.d.ts | 1485 |
| PopStateEventInit | lib.dom.d.ts | 1489 |
| PositionOptions | lib.dom.d.ts | 1493 |
| ProgressEventInit | lib.dom.d.ts | 1499 |
| PromiseRejectionEventInit | lib.dom.d.ts | 1505 |
| PropertyDefinition | lib.dom.d.ts | 1510 |
| PropertyIndexedKeyframes | lib.dom.d.ts | 1517 |
| PublicKeyCredentialCreationOptions | lib.dom.d.ts | 1524 |
| PublicKeyCredentialCreationOptionsJSON | lib.dom.d.ts | 1536 |
| PublicKeyCredentialDescriptor | lib.dom.d.ts | 1549 |
| PublicKeyCredentialDescriptorJSON | lib.dom.d.ts | 1555 |
| PublicKeyCredentialParameters | lib.dom.d.ts | 1565 |
| PushSubscriptionJSON | lib.dom.d.ts | 1604 |
| PushSubscriptionOptionsInit | lib.dom.d.ts | 1610 |
| QueuingStrategy | lib.dom.d.ts | 1615 |
| QueuingStrategyInit | lib.dom.d.ts | 1620 |
| RTCAnswerOptions | lib.dom.d.ts | 1629 |
| RTCCertificateExpiration | lib.dom.d.ts | 1632 |
| RTCConfiguration | lib.dom.d.ts | 1636 |
| RTCDTMFToneChangeEventInit | lib.dom.d.ts | 1645 |
| RTCDataChannelEventInit | lib.dom.d.ts | 1649 |
| RTCDataChannelInit | lib.dom.d.ts | 1653 |
| RTCDtlsFingerprint | lib.dom.d.ts | 1662 |
| RTCEncodedAudioFrameMetadata | lib.dom.d.ts | 1667 |
| RTCEncodedFrameMetadata | lib.dom.d.ts | 1671 |
| RTCEncodedVideoFrameMetadata | lib.dom.d.ts | 1679 |
| RTCErrorEventInit | lib.dom.d.ts | 1689 |
| RTCErrorInit | lib.dom.d.ts | 1693 |
| RTCIceCandidateInit | lib.dom.d.ts | 1702 |
| RTCIceCandidatePairStats | lib.dom.d.ts | 1709 |
| RTCIceServer | lib.dom.d.ts | 1734 |
| RTCInboundRtpStreamStats | lib.dom.d.ts | 1740 |
| RTCLocalIceCandidateInit | lib.dom.d.ts | 1795 |
| RTCLocalSessionDescriptionInit | lib.dom.d.ts | 1798 |
| RTCOfferAnswerOptions | lib.dom.d.ts | 1803 |
| RTCOfferOptions | lib.dom.d.ts | 1806 |
| RTCOutboundRtpStreamStats | lib.dom.d.ts | 1812 |
| RTCPeerConnectionIceErrorEventInit | lib.dom.d.ts | 1843 |
| RTCPeerConnectionIceEventInit | lib.dom.d.ts | 1851 |
| RTCReceivedRtpStreamStats | lib.dom.d.ts | 1855 |
| RTCRtcpParameters | lib.dom.d.ts | 1861 |
| RTCRtpCapabilities | lib.dom.d.ts | 1866 |
| RTCRtpCodec | lib.dom.d.ts | 1871 |
| RTCRtpCodecParameters | lib.dom.d.ts | 1878 |
| RTCRtpCodingParameters | lib.dom.d.ts | 1882 |
| RTCRtpContributingSource | lib.dom.d.ts | 1886 |
| RTCRtpEncodingParameters | lib.dom.d.ts | 1893 |
| RTCRtpHeaderExtensionCapability | lib.dom.d.ts | 1902 |
| RTCRtpHeaderExtensionParameters | lib.dom.d.ts | 1906 |
| RTCRtpParameters | lib.dom.d.ts | 1912 |
| RTCRtpReceiveParameters | lib.dom.d.ts | 1918 |
| RTCRtpSendParameters | lib.dom.d.ts | 1921 |
| RTCRtpStreamStats | lib.dom.d.ts | 1927 |
| RTCRtpSynchronizationSource | lib.dom.d.ts | 1934 |
| RTCRtpTransceiverInit | lib.dom.d.ts | 1937 |
| RTCSentRtpStreamStats | lib.dom.d.ts | 1943 |
| RTCSessionDescriptionInit | lib.dom.d.ts | 1948 |
| RTCSetParameterOptions | lib.dom.d.ts | 1953 |
| RTCStats | lib.dom.d.ts | 1956 |
| RTCTrackEventInit | lib.dom.d.ts | 1962 |
| RTCTransportStats | lib.dom.d.ts | 1969 |
| ReadableStreamGetReaderOptions | lib.dom.d.ts | 1988 |
| ReadableStreamIteratorOptions | lib.dom.d.ts | 1997 |
| ReadableStreamReadDoneResult | lib.dom.d.ts | 2008 |
| ReadableStreamReadValueResult | lib.dom.d.ts | 2013 |
| ReadableWritablePair | lib.dom.d.ts | 2018 |
| RegistrationOptions | lib.dom.d.ts | 2028 |
| ReportingObserverOptions | lib.dom.d.ts | 2034 |
| ResizeObserverOptions | lib.dom.d.ts | 2069 |
| RsaHashedImportParams | lib.dom.d.ts | 2079 |
| RsaHashedKeyAlgorithm | lib.dom.d.ts | 2083 |
| RsaHashedKeyGenParams | lib.dom.d.ts | 2087 |
| RsaKeyAlgorithm | lib.dom.d.ts | 2091 |
| RsaKeyGenParams | lib.dom.d.ts | 2096 |
| RsaOaepParams | lib.dom.d.ts | 2101 |
| RsaOtherPrimesInfo | lib.dom.d.ts | 2105 |
| RsaPssParams | lib.dom.d.ts | 2111 |
| SVGBoundingBoxOptions | lib.dom.d.ts | 2115 |
| ScrollIntoViewOptions | lib.dom.d.ts | 2122 |
| ScrollOptions | lib.dom.d.ts | 2127 |
| ScrollToOptions | lib.dom.d.ts | 2131 |
| SecurityPolicyViolationEventInit | lib.dom.d.ts | 2136 |
| ShadowRootInit | lib.dom.d.ts | 2151 |
| ShareData | lib.dom.d.ts | 2160 |
| SpeechSynthesisErrorEventInit | lib.dom.d.ts | 2167 |
| SpeechSynthesisEventInit | lib.dom.d.ts | 2171 |
| StartViewTransitionOptions | lib.dom.d.ts | 2179 |
| StaticRangeInit | lib.dom.d.ts | 2184 |
| StereoPannerOptions | lib.dom.d.ts | 2191 |
| StorageEstimate | lib.dom.d.ts | 2195 |
| StorageEventInit | lib.dom.d.ts | 2200 |
| StreamPipeOptions | lib.dom.d.ts | 2208 |
| StructuredSerializeOptions | lib.dom.d.ts | 2232 |
| SubmitEventInit | lib.dom.d.ts | 2236 |
| TextDecodeOptions | lib.dom.d.ts | 2240 |
| TextDecoderOptions | lib.dom.d.ts | 2244 |
| TextEncoderEncodeIntoResult | lib.dom.d.ts | 2249 |
| ToggleEventInit | lib.dom.d.ts | 2254 |
| TouchEventInit | lib.dom.d.ts | 2259 |
| TouchInit | lib.dom.d.ts | 2265 |
| TrackEventInit | lib.dom.d.ts | 2283 |
| Transformer | lib.dom.d.ts | 2287 |
| TransitionEventInit | lib.dom.d.ts | 2295 |
| UIEventInit | lib.dom.d.ts | 2301 |
| ULongRange | lib.dom.d.ts | 2308 |
| UnderlyingByteSource | lib.dom.d.ts | 2313 |
| UnderlyingDefaultSource | lib.dom.d.ts | 2321 |
| UnderlyingSink | lib.dom.d.ts | 2328 |
| UnderlyingSource | lib.dom.d.ts | 2336 |
| ValidityStateFlags | lib.dom.d.ts | 2344 |
| VideoColorSpaceInit | lib.dom.d.ts | 2357 |
| VideoConfiguration | lib.dom.d.ts | 2364 |
| VideoDecoderConfig | lib.dom.d.ts | 2377 |
| VideoDecoderInit | lib.dom.d.ts | 2389 |
| VideoDecoderSupport | lib.dom.d.ts | 2394 |
| VideoEncoderConfig | lib.dom.d.ts | 2399 |
| VideoEncoderEncodeOptions | lib.dom.d.ts | 2416 |
| VideoEncoderEncodeOptionsForAvc | lib.dom.d.ts | 2421 |
| VideoEncoderInit | lib.dom.d.ts | 2425 |
| VideoEncoderSupport | lib.dom.d.ts | 2430 |
| VideoFrameBufferInit | lib.dom.d.ts | 2435 |
| VideoFrameCallbackMetadata | lib.dom.d.ts | 2448 |
| VideoFrameCopyToOptions | lib.dom.d.ts | 2461 |
| VideoFrameInit | lib.dom.d.ts | 2468 |
| WaveShaperOptions | lib.dom.d.ts | 2477 |
| WebGLContextAttributes | lib.dom.d.ts | 2482 |
| WebGLContextEventInit | lib.dom.d.ts | 2494 |
| WebTransportCloseInfo | lib.dom.d.ts | 2498 |
| WebTransportErrorOptions | lib.dom.d.ts | 2503 |
| WebTransportHash | lib.dom.d.ts | 2508 |
| WebTransportOptions | lib.dom.d.ts | 2513 |
| WebTransportSendOptions | lib.dom.d.ts | 2520 |
| WebTransportSendStreamOptions | lib.dom.d.ts | 2524 |
| WheelEventInit | lib.dom.d.ts | 2527 |
| WindowPostMessageOptions | lib.dom.d.ts | 2534 |
| WorkerOptions | lib.dom.d.ts | 2538 |
| WorkletOptions | lib.dom.d.ts | 2544 |
| WriteParams | lib.dom.d.ts | 2548 |
| NodeFilter | lib.dom.d.ts | 2555 |
| XPathNSResolver | lib.dom.d.ts | 2576 |
| ANGLE_instanced_arrays | lib.dom.d.ts | 2583 |
| ARIAMixin | lib.dom.d.ts | 2605 |
| AbortController | lib.dom.d.ts | 2717 |
| AbortSignalEventMap | lib.dom.d.ts | 2737 |
| AbortSignal | lib.dom.d.ts | 2746 |
| AbstractRange | lib.dom.d.ts | 2801 |
| AbstractWorkerEventMap | lib.dom.d.ts | 2839 |
| AbstractWorker | lib.dom.d.ts | 2843 |
| AnalyserNode | lib.dom.d.ts | 2857 |
| Animatable | lib.dom.d.ts | 2919 |
| AnimationEventMap | lib.dom.d.ts | 2926 |
| Animation | lib.dom.d.ts | 2937 |
| AnimationEffect | lib.dom.d.ts | 3074 |
| AnimationEvent | lib.dom.d.ts | 3105 |
| AnimationFrameProvider | lib.dom.d.ts | 3131 |
| AnimationPlaybackEvent | lib.dom.d.ts | 3143 |
| AnimationTimeline | lib.dom.d.ts | 3168 |
| Attr | lib.dom.d.ts | 3187 |
| AudioBuffer | lib.dom.d.ts | 3247 |
| AudioBufferSourceNode | lib.dom.d.ts | 3302 |
| AudioContext | lib.dom.d.ts | 3361 |
| AudioData | lib.dom.d.ts | 3432 |
| AudioDecoderEventMap | lib.dom.d.ts | 3500 |
| AudioDecoder | lib.dom.d.ts | 3510 |
| AudioDestinationNode | lib.dom.d.ts | 3577 |
| AudioEncoderEventMap | lib.dom.d.ts | 3591 |
| AudioEncoder | lib.dom.d.ts | 3601 |
| AudioListener | lib.dom.d.ts | 3668 |
| AudioNode | lib.dom.d.ts | 3749 |
| AudioParam | lib.dom.d.ts | 3817 |
| AudioParamMap | lib.dom.d.ts | 3897 |
| AudioProcessingEvent | lib.dom.d.ts | 3912 |
| AudioScheduledSourceNodeEventMap | lib.dom.d.ts | 3942 |
| AudioScheduledSourceNode | lib.dom.d.ts | 3951 |
| AudioWorklet | lib.dom.d.ts | 3983 |
| AudioWorkletNodeEventMap | lib.dom.d.ts | 3991 |
| AudioWorkletNode | lib.dom.d.ts | 4001 |
| BarProp | lib.dom.d.ts | 4128 |
| BaseAudioContextEventMap | lib.dom.d.ts | 4142 |
| BaseAudioContext | lib.dom.d.ts | 4151 |
| BeforeUnloadEvent | lib.dom.d.ts | 4322 |
| BiquadFilterNode | lib.dom.d.ts | 4342 |
| Blob | lib.dom.d.ts | 4391 |
| BlobEvent | lib.dom.d.ts | 4446 |
| Body | lib.dom.d.ts | 4466 |
| BroadcastChannelEventMap | lib.dom.d.ts | 4485 |
| BroadcastChannel | lib.dom.d.ts | 4495 |
| ByteLengthQueuingStrategy | lib.dom.d.ts | 4534 |
| CDATASection | lib.dom.d.ts | 4555 |
| CSPViolationReportBody | lib.dom.d.ts | 4568 |
| CSSAnimation | lib.dom.d.ts | 4653 |
| CSSConditionRule | lib.dom.d.ts | 4676 |
| CSSContainerRule | lib.dom.d.ts | 4695 |
| CSSCounterStyleRule | lib.dom.d.ts | 4720 |
| CSSFontFaceRule | lib.dom.d.ts | 4799 |
| CSSFontFeatureValuesRule | lib.dom.d.ts | 4819 |
| CSSFontPaletteValuesRule | lib.dom.d.ts | 4838 |
| CSSGroupingRule | lib.dom.d.ts | 4875 |
| CSSImageValue | lib.dom.d.ts | 4906 |
| CSSImportRule | lib.dom.d.ts | 4919 |
| CSSKeyframeRule | lib.dom.d.ts | 4963 |
| CSSKeyframesRule | lib.dom.d.ts | 4989 |
| CSSKeywordValue | lib.dom.d.ts | 5039 |
| CSSLayerBlockRule | lib.dom.d.ts | 5058 |
| CSSLayerStatementRule | lib.dom.d.ts | 5077 |
| CSSMathClamp | lib.dom.d.ts | 5091 |
| CSSMathInvert | lib.dom.d.ts | 5107 |
| CSSMathMax | lib.dom.d.ts | 5126 |
| CSSMathMin | lib.dom.d.ts | 5145 |
| CSSMathNegate | lib.dom.d.ts | 5164 |
| CSSMathProduct | lib.dom.d.ts | 5183 |
| CSSMathSum | lib.dom.d.ts | 5202 |
| CSSMathValue | lib.dom.d.ts | 5221 |
| CSSMediaRule | lib.dom.d.ts | 5259 |
| CSSNamespaceRule | lib.dom.d.ts | 5279 |
| CSSNestedDeclarations | lib.dom.d.ts | 5304 |
| CSSNumericArray | lib.dom.d.ts | 5324 |
| CSSNumericValue | lib.dom.d.ts | 5345 |
| CSSPageRule | lib.dom.d.ts | 5424 |
| CSSPerspective | lib.dom.d.ts | 5450 |
| CSSPropertyRule | lib.dom.d.ts | 5469 |
| CSSRotate | lib.dom.d.ts | 5506 |
| CSSRule | lib.dom.d.ts | 5544 |
| CSSRuleList | lib.dom.d.ts | 5606 |
| CSSScale | lib.dom.d.ts | 5632 |
| CSSScopeRule | lib.dom.d.ts | 5663 |
| CSSSkew | lib.dom.d.ts | 5688 |
| CSSSkewX | lib.dom.d.ts | 5713 |
| CSSSkewY | lib.dom.d.ts | 5732 |
| CSSStartingStyleRule | lib.dom.d.ts | 5751 |
| CSSStyleDeclaration | lib.dom.d.ts | 5764 |
| CSSStyleRule | lib.dom.d.ts | 7124 |
| CSSStyleSheet | lib.dom.d.ts | 7156 |
| CSSStyleValue | lib.dom.d.ts | 7226 |
| CSSSupportsRule | lib.dom.d.ts | 7252 |
| CSSTransformValue | lib.dom.d.ts | 7291 |
| CSSTransition | lib.dom.d.ts | 7324 |
| CSSTranslate | lib.dom.d.ts | 7347 |
| CSSUnitValue | lib.dom.d.ts | 7378 |
| CSSUnparsedValue | lib.dom.d.ts | 7403 |
| CSSVariableReferenceValue | lib.dom.d.ts | 7424 |
| CSSViewTransitionRule | lib.dom.d.ts | 7444 |
| Cache | lib.dom.d.ts | 7460 |
| CacheStorage | lib.dom.d.ts | 7516 |
| CanvasCaptureMediaStreamTrack | lib.dom.d.ts | 7559 |
| CanvasCompositing | lib.dom.d.ts | 7583 |
| CanvasDrawImage | lib.dom.d.ts | 7590 |
| CanvasDrawPath | lib.dom.d.ts | 7597 |
| CanvasFillStrokeStyles | lib.dom.d.ts | 7617 |
| CanvasFilters | lib.dom.d.ts | 7632 |
| CanvasGradient | lib.dom.d.ts | 7642 |
| CanvasImageData | lib.dom.d.ts | 7656 |
| CanvasImageSmoothing | lib.dom.d.ts | 7667 |
| CanvasPath | lib.dom.d.ts | 7674 |
| CanvasPathDrawingStyles | lib.dom.d.ts | 7697 |
| CanvasPattern | lib.dom.d.ts | 7719 |
| CanvasRect | lib.dom.d.ts | 7733 |
| CanvasRenderingContext2D | lib.dom.d.ts | 7747 |
| CanvasSettings | lib.dom.d.ts | 7761 |
| CanvasShadowStyles | lib.dom.d.ts | 7766 |
| CanvasState | lib.dom.d.ts | 7777 |
| CanvasText | lib.dom.d.ts | 7788 |
| CanvasTextDrawingStyles | lib.dom.d.ts | 7797 |
| CanvasTransform | lib.dom.d.ts | 7820 |
| CanvasUserInterface | lib.dom.d.ts | 7838 |
| CaretPosition | lib.dom.d.ts | 7849 |
| ChannelMergerNode | lib.dom.d.ts | 7865 |
| ChannelSplitterNode | lib.dom.d.ts | 7878 |
| CharacterData | lib.dom.d.ts | 7891 |
| ChildNode | lib.dom.d.ts | 7945 |
| ClientRect | lib.dom.d.ts | 7979 |
| Clipboard | lib.dom.d.ts | 7988 |
| ClipboardEvent | lib.dom.d.ts | 8025 |
| ClipboardItem | lib.dom.d.ts | 8045 |
| CloseEvent | lib.dom.d.ts | 8082 |
| Comment | lib.dom.d.ts | 8113 |
| CompositionEvent | lib.dom.d.ts | 8126 |
| CompressionStream | lib.dom.d.ts | 8152 |
| ConstantSourceNode | lib.dom.d.ts | 8167 |
| ContentVisibilityAutoStateChangeEvent | lib.dom.d.ts | 8190 |
| ConvolverNode | lib.dom.d.ts | 8209 |
| CookieChangeEvent | lib.dom.d.ts | 8235 |
| CookieStoreEventMap | lib.dom.d.ts | 8255 |
| CookieStore | lib.dom.d.ts | 8265 |
| CookieStoreManager | lib.dom.d.ts | 8313 |
| CountQueuingStrategy | lib.dom.d.ts | 8344 |
| Credential | lib.dom.d.ts | 8366 |
| CredentialsContainer | lib.dom.d.ts | 8392 |
| Crypto | lib.dom.d.ts | 8429 |
| CryptoKey | lib.dom.d.ts | 8463 |
| CustomElementRegistry | lib.dom.d.ts | 8500 |
| CustomEvent | lib.dom.d.ts | 8543 |
| CustomStateSet | lib.dom.d.ts | 8569 |
| DOMException | lib.dom.d.ts | 8583 |
| DOMImplementation | lib.dom.d.ts | 8665 |
| DOMMatrix | lib.dom.d.ts | 8703 |
| SVGMatrix | lib.dom.d.ts | 8830 |
| WebKitCSSMatrix | lib.dom.d.ts | 8833 |
| DOMMatrixReadOnly | lib.dom.d.ts | 8841 |
| DOMParser | lib.dom.d.ts | 9012 |
| DOMPoint | lib.dom.d.ts | 9031 |
| SVGPoint | lib.dom.d.ts | 9069 |
| DOMPointReadOnly | lib.dom.d.ts | 9077 |
| DOMQuad | lib.dom.d.ts | 9132 |
| DOMRect | lib.dom.d.ts | 9183 |
| SVGRect | lib.dom.d.ts | 9221 |
| DOMRectList | lib.dom.d.ts | 9229 |
| DOMRectReadOnly | lib.dom.d.ts | 9255 |
| DOMStringList | lib.dom.d.ts | 9328 |
| DOMStringMap | lib.dom.d.ts | 9360 |
| DOMTokenList | lib.dom.d.ts | 9374 |
| DataTransfer | lib.dom.d.ts | 9444 |
| DataTransferItem | lib.dom.d.ts | 9511 |
| DataTransferItemList | lib.dom.d.ts | 9554 |
| DecompressionStream | lib.dom.d.ts | 9593 |
| DelayNode | lib.dom.d.ts | 9608 |
| DeviceMotionEvent | lib.dom.d.ts | 9628 |
| DeviceMotionEventAcceleration | lib.dom.d.ts | 9666 |
| DeviceMotionEventRotationRate | lib.dom.d.ts | 9693 |
| DeviceOrientationEvent | lib.dom.d.ts | 9720 |
| DocumentEventMap | lib.dom.d.ts | 9752 |
| Document | lib.dom.d.ts | 9767 |
| DocumentFragment | lib.dom.d.ts | 10416 |
| DocumentOrShadowRoot | lib.dom.d.ts | 10429 |
| DocumentTimeline | lib.dom.d.ts | 10465 |
| DocumentType | lib.dom.d.ts | 10478 |
| DragEvent | lib.dom.d.ts | 10512 |
| DynamicsCompressorNode | lib.dom.d.ts | 10531 |
| EXT_blend_minmax | lib.dom.d.ts | 10580 |
| EXT_color_buffer_float | lib.dom.d.ts | 10590 |
| EXT_color_buffer_half_float | lib.dom.d.ts | 10598 |
| EXT_float_blend | lib.dom.d.ts | 10610 |
| EXT_frag_depth | lib.dom.d.ts | 10618 |
| EXT_sRGB | lib.dom.d.ts | 10626 |
| EXT_shader_texture_lod | lib.dom.d.ts | 10638 |
| EXT_texture_compression_bptc | lib.dom.d.ts | 10646 |
| EXT_texture_compression_rgtc | lib.dom.d.ts | 10658 |
| EXT_texture_filter_anisotropic | lib.dom.d.ts | 10670 |
| EXT_texture_norm16 | lib.dom.d.ts | 10680 |
| ElementEventMap | lib.dom.d.ts | 10691 |
| Element | lib.dom.d.ts | 10701 |
| ElementCSSInlineStyle | lib.dom.d.ts | 11115 |
| ElementContentEditable | lib.dom.d.ts | 11123 |
| ElementInternals | lib.dom.d.ts | 11139 |
| EncodedAudioChunk | lib.dom.d.ts | 11218 |
| EncodedVideoChunk | lib.dom.d.ts | 11261 |
| ErrorEvent | lib.dom.d.ts | 11304 |
| Event | lib.dom.d.ts | 11347 |
| EventCounts | lib.dom.d.ts | 11480 |
| EventListener | lib.dom.d.ts | 11489 |
| EventListenerObject | lib.dom.d.ts | 11493 |
| EventSourceEventMap | lib.dom.d.ts | 11497 |
| EventSource | lib.dom.d.ts | 11508 |
| EventTarget | lib.dom.d.ts | 11563 |
| External | lib.dom.d.ts | 11590 |
| File | lib.dom.d.ts | 11608 |
| FileList | lib.dom.d.ts | 11639 |
| FileReaderEventMap | lib.dom.d.ts | 11660 |
| FileReader | lib.dom.d.ts | 11674 |
| FileSystem | lib.dom.d.ts | 11758 |
| FileSystemDirectoryEntry | lib.dom.d.ts | 11783 |
| FileSystemDirectoryHandle | lib.dom.d.ts | 11815 |
| FileSystemDirectoryReader | lib.dom.d.ts | 11853 |
| FileSystemEntry | lib.dom.d.ts | 11872 |
| FileSystemFileEntry | lib.dom.d.ts | 11921 |
| FileSystemFileHandle | lib.dom.d.ts | 11941 |
| FileSystemHandle | lib.dom.d.ts | 11968 |
| FileSystemWritableFileStream | lib.dom.d.ts | 12000 |
| FocusEvent | lib.dom.d.ts | 12031 |
| FontFace | lib.dom.d.ts | 12050 |
| FontFaceSetEventMap | lib.dom.d.ts | 12136 |
| FontFaceSet | lib.dom.d.ts | 12147 |
| FontFaceSetLoadEvent | lib.dom.d.ts | 12195 |
| FontFaceSource | lib.dom.d.ts | 12209 |
| FragmentDirective | lib.dom.d.ts | 12292 |
| GPUError | lib.dom.d.ts | 12306 |
| GainNode | lib.dom.d.ts | 12320 |
| Gamepad | lib.dom.d.ts | 12339 |
| GamepadEvent | lib.dom.d.ts | 12431 |
| GamepadHapticActuator | lib.dom.d.ts | 12450 |
| GenericTransformStream | lib.dom.d.ts | 12470 |
| Geolocation | lib.dom.d.ts | 12482 |
| GeolocationCoordinates | lib.dom.d.ts | 12514 |
| GeolocationPosition | lib.dom.d.ts | 12576 |
| GeolocationPositionError | lib.dom.d.ts | 12607 |
| GlobalEventHandlersEventMap | lib.dom.d.ts | 12633 |
| GlobalEventHandlers | lib.dom.d.ts | 12741 |
| HTMLAllCollection | lib.dom.d.ts | 12977 |
| HTMLAnchorElement | lib.dom.d.ts | 13009 |
| HTMLAreaElement | lib.dom.d.ts | 13091 |
| HTMLAudioElement | lib.dom.d.ts | 13165 |
| HTMLBRElement | lib.dom.d.ts | 13182 |
| HTMLBaseElement | lib.dom.d.ts | 13201 |
| HTMLBodyElementEventMap | lib.dom.d.ts | 13225 |
| HTMLBodyElement | lib.dom.d.ts | 13233 |
| HTMLCanvasElement | lib.dom.d.ts | 13381 |
| HTMLCollectionBase | lib.dom.d.ts | 13444 |
| HTMLCollection | lib.dom.d.ts | 13460 |
| HTMLCollectionOf | lib.dom.d.ts | 13474 |
| HTMLDListElement | lib.dom.d.ts | 13485 |
| HTMLDataElement | lib.dom.d.ts | 13504 |
| HTMLDataListElement | lib.dom.d.ts | 13527 |
| HTMLDetailsElement | lib.dom.d.ts | 13550 |
| HTMLDialogElement | lib.dom.d.ts | 13579 |
| HTMLDirectoryElement | lib.dom.d.ts | 13628 |
| HTMLDivElement | lib.dom.d.ts | 13648 |
| HTMLDocument | lib.dom.d.ts | 13662 |
| HTMLElementEventMap | lib.dom.d.ts | 13674 |
| HTMLElement | lib.dom.d.ts | 13682 |
| HTMLEmbedElement | lib.dom.d.ts | 13855 |
| HTMLFieldSetElement | lib.dom.d.ts | 13906 |
| HTMLFontElement | lib.dom.d.ts | 13990 |
| HTMLFormControlsCollection | lib.dom.d.ts | 14029 |
| HTMLFormElement | lib.dom.d.ts | 14048 |
| HTMLFrameElement | lib.dom.d.ts | 14172 |
| HTMLFrameSetElementEventMap | lib.dom.d.ts | 14205 |
| HTMLFrameSetElement | lib.dom.d.ts | 14214 |
| HTMLHRElement | lib.dom.d.ts | 14236 |
| HTMLHeadElement | lib.dom.d.ts | 14263 |
| HTMLHeadingElement | lib.dom.d.ts | 14280 |
| HTMLHtmlElement | lib.dom.d.ts | 14299 |
| HTMLHyperlinkElementUtils | lib.dom.d.ts | 14318 |
| HTMLIFrameElement | lib.dom.d.ts | 14413 |
| HTMLImageElement | lib.dom.d.ts | 14521 |
| HTMLLIElement | lib.dom.d.ts | 15054 |
| HTMLLabelElement | lib.dom.d.ts | 15079 |
| HTMLLegendElement | lib.dom.d.ts | 15114 |
| HTMLLinkElement | lib.dom.d.ts | 15139 |
| HTMLMapElement | lib.dom.d.ts | 15261 |
| HTMLMarqueeElement | lib.dom.d.ts | 15291 |
| HTMLMediaElementEventMap | lib.dom.d.ts | 15330 |
| HTMLMediaElement | lib.dom.d.ts | 15340 |
| HTMLMenuElement | lib.dom.d.ts | 15611 |
| HTMLMetaElement | lib.dom.d.ts | 15630 |
| HTMLMeterElement | lib.dom.d.ts | 15678 |
| HTMLOListElement | lib.dom.d.ts | 15766 |
| HTMLObjectElement | lib.dom.d.ts | 15803 |
| HTMLOptGroupElement | lib.dom.d.ts | 15937 |
| HTMLOptionElement | lib.dom.d.ts | 15966 |
| HTMLOptionsCollection | lib.dom.d.ts | 16031 |
| HTMLOrSVGElement | lib.dom.d.ts | 16063 |
| HTMLOutputElement | lib.dom.d.ts | 16083 |
| HTMLParagraphElement | lib.dom.d.ts | 16179 |
| HTMLParamElement | lib.dom.d.ts | 16199 |
| HTMLPictureElement | lib.dom.d.ts | 16225 |
| HTMLPreElement | lib.dom.d.ts | 16242 |
| HTMLProgressElement | lib.dom.d.ts | 16261 |
| HTMLQuoteElement | lib.dom.d.ts | 16302 |
| HTMLScriptElement | lib.dom.d.ts | 16325 |
| HTMLSelectElement | lib.dom.d.ts | 16421 |
| HTMLSlotElement | lib.dom.d.ts | 16590 |
| HTMLSourceElement | lib.dom.d.ts | 16631 |
| HTMLSpanElement | lib.dom.d.ts | 16690 |
| HTMLStyleElement | lib.dom.d.ts | 16707 |
| HTMLTableCaptionElement | lib.dom.d.ts | 16750 |
| HTMLTableCellElement | lib.dom.d.ts | 16774 |
| HTMLTableColElement | lib.dom.d.ts | 16875 |
| HTMLTableDataCellElement | lib.dom.d.ts | 16924 |
| HTMLTableElement | lib.dom.d.ts | 16936 |
| HTMLTableHeaderCellElement | lib.dom.d.ts | 17096 |
| HTMLTableRowElement | lib.dom.d.ts | 17108 |
| HTMLTableSectionElement | lib.dom.d.ts | 17190 |
| HTMLTemplateElement | lib.dom.d.ts | 17253 |
| HTMLTextAreaElement | lib.dom.d.ts | 17300 |
| HTMLTimeElement | lib.dom.d.ts | 17498 |
| HTMLTitleElement | lib.dom.d.ts | 17521 |
| HTMLTrackElement | lib.dom.d.ts | 17544 |
| HTMLUListElement | lib.dom.d.ts | 17611 |
| HTMLUnknownElement | lib.dom.d.ts | 17632 |
| HTMLVideoElementEventMap | lib.dom.d.ts | 17644 |
| HTMLVideoElement | lib.dom.d.ts | 17654 |
| HashChangeEvent | lib.dom.d.ts | 17736 |
| Headers | lib.dom.d.ts | 17761 |
| Highlight | lib.dom.d.ts | 17811 |
| HighlightRegistry | lib.dom.d.ts | 17837 |
| History | lib.dom.d.ts | 17851 |
| IDBCursor | lib.dom.d.ts | 17912 |
| IDBCursorWithValue | lib.dom.d.ts | 17985 |
| IDBDatabaseEventMap | lib.dom.d.ts | 17999 |
| IDBDatabase | lib.dom.d.ts | 18011 |
| IDBFactory | lib.dom.d.ts | 18076 |
| IDBIndex | lib.dom.d.ts | 18113 |
| IDBKeyRange | lib.dom.d.ts | 18198 |
| IDBObjectStore | lib.dom.d.ts | 18265 |
| IDBTransactionEventMap | lib.dom.d.ts | 18469 |
| IDBTransaction | lib.dom.d.ts | 18480 |
| IDBVersionChangeEvent | lib.dom.d.ts | 18551 |
| IIRFilterNode | lib.dom.d.ts | 18576 |
| IdleDeadline | lib.dom.d.ts | 18595 |
| ImageBitmap | lib.dom.d.ts | 18620 |
| ImageBitmapRenderingContext | lib.dom.d.ts | 18651 |
| ImageCapture | lib.dom.d.ts | 18677 |
| ImageData | lib.dom.d.ts | 18714 |
| ImageDecoder | lib.dom.d.ts | 18753 |
| ImageTrack | lib.dom.d.ts | 18814 |
| ImageTrackList | lib.dom.d.ts | 18851 |
| ImportMeta | lib.dom.d.ts | 18884 |
| IntersectionObserver | lib.dom.d.ts | 18957 |
| IntersectionObserverEntry | lib.dom.d.ts | 19012 |
| KHR_parallel_shader_compile | lib.dom.d.ts | 19067 |
| KeyboardEvent | lib.dom.d.ts | 19076 |
| KeyframeEffect | lib.dom.d.ts | 19178 |
| LargestContentfulPaint | lib.dom.d.ts | 19228 |
| LinkStyle | lib.dom.d.ts | 19274 |
| Location | lib.dom.d.ts | 19284 |
| Lock | lib.dom.d.ts | 19377 |
| LockManager | lib.dom.d.ts | 19403 |
| MIDIAccessEventMap | lib.dom.d.ts | 19424 |
| MIDIAccess | lib.dom.d.ts | 19434 |
| MIDIConnectionEvent | lib.dom.d.ts | 19472 |
| MIDIMessageEvent | lib.dom.d.ts | 19531 |
| MIDIOutput | lib.dom.d.ts | 19551 |
| MIDIOutputMap | lib.dom.d.ts | 19575 |
| MIDIPortEventMap | lib.dom.d.ts | 19584 |
| MIDIPort | lib.dom.d.ts | 19594 |
| MathMLElementEventMap | lib.dom.d.ts | 19662 |
| MathMLElement | lib.dom.d.ts | 19670 |
| MediaCapabilities | lib.dom.d.ts | 19687 |
| MediaDeviceInfo | lib.dom.d.ts | 19713 |
| MediaDevicesEventMap | lib.dom.d.ts | 19751 |
| MediaDevices | lib.dom.d.ts | 19761 |
| MediaElementAudioSourceNode | lib.dom.d.ts | 19804 |
| MediaEncryptedEvent | lib.dom.d.ts | 19823 |
| MediaError | lib.dom.d.ts | 19848 |
| MediaKeyMessageEvent | lib.dom.d.ts | 19882 |
| MediaKeySessionEventMap | lib.dom.d.ts | 19902 |
| MediaKeySession | lib.dom.d.ts | 19913 |
| MediaKeyStatusMap | lib.dom.d.ts | 19989 |
| MediaKeySystemAccess | lib.dom.d.ts | 20022 |
| MediaKeys | lib.dom.d.ts | 20054 |
| MediaList | lib.dom.d.ts | 20085 |
| MediaMetadata | lib.dom.d.ts | 20130 |
| MediaQueryListEventMap | lib.dom.d.ts | 20162 |
| MediaQueryList | lib.dom.d.ts | 20171 |
| MediaQueryListEvent | lib.dom.d.ts | 20216 |
| MediaRecorderEventMap | lib.dom.d.ts | 20236 |
| MediaRecorder | lib.dom.d.ts | 20250 |
| MediaSession | lib.dom.d.ts | 20345 |
| MediaSourceEventMap | lib.dom.d.ts | 20389 |
| MediaSource | lib.dom.d.ts | 20400 |
| MediaSourceHandle | lib.dom.d.ts | 20486 |
| MediaStreamEventMap | lib.dom.d.ts | 20494 |
| MediaStream | lib.dom.d.ts | 20504 |
| MediaStreamAudioDestinationNode | lib.dom.d.ts | 20581 |
| MediaStreamAudioSourceNode | lib.dom.d.ts | 20600 |
| MediaStreamTrackEventMap | lib.dom.d.ts | 20614 |
| MediaStreamTrack | lib.dom.d.ts | 20625 |
| MediaStreamTrackEvent | lib.dom.d.ts | 20726 |
| MessageChannel | lib.dom.d.ts | 20745 |
| MessageEvent | lib.dom.d.ts | 20770 |
| MessageEventTargetEventMap | lib.dom.d.ts | 20810 |
| MessageEventTarget | lib.dom.d.ts | 20815 |
| MessagePortEventMap | lib.dom.d.ts | 20826 |
| MessagePort | lib.dom.d.ts | 20836 |
| MimeType | lib.dom.d.ts | 20873 |
| MimeTypeArray | lib.dom.d.ts | 20908 |
| MouseEvent | lib.dom.d.ts | 20929 |
| MutationObserver | lib.dom.d.ts | 21081 |
| MutationRecord | lib.dom.d.ts | 21112 |
| NamedNodeMap | lib.dom.d.ts | 21179 |
| NavigationActivation | lib.dom.d.ts | 21241 |
| NavigationHistoryEntryEventMap | lib.dom.d.ts | 21267 |
| NavigationHistoryEntry | lib.dom.d.ts | 21276 |
| NavigationPreloadManager | lib.dom.d.ts | 21332 |
| Navigator | lib.dom.d.ts | 21369 |
| NavigatorAutomationInformation | lib.dom.d.ts | 21501 |
| NavigatorBadge | lib.dom.d.ts | 21507 |
| NavigatorConcurrentHardware | lib.dom.d.ts | 21514 |
| NavigatorContentUtils | lib.dom.d.ts | 21519 |
| NavigatorCookies | lib.dom.d.ts | 21528 |
| NavigatorID | lib.dom.d.ts | 21533 |
| NavigatorLanguage | lib.dom.d.ts | 21586 |
| NavigatorLocks | lib.dom.d.ts | 21594 |
| NavigatorLogin | lib.dom.d.ts | 21605 |
| NavigatorOnLine | lib.dom.d.ts | 21619 |
| NavigatorPlugins | lib.dom.d.ts | 21624 |
| NavigatorStorage | lib.dom.d.ts | 21648 |
| Node | lib.dom.d.ts | 21658 |
| NodeIterator | lib.dom.d.ts | 21907 |
| NodeList | lib.dom.d.ts | 21969 |
| NodeListOf | lib.dom.d.ts | 21991 |
| NonDocumentTypeChildNode | lib.dom.d.ts | 21997 |
| NonElementParentNode | lib.dom.d.ts | 22012 |
| NotificationEventMap | lib.dom.d.ts | 22021 |
| Notification | lib.dom.d.ts | 22033 |
| OES_draw_buffers_indexed | lib.dom.d.ts | 22136 |
| OES_element_index_uint | lib.dom.d.ts | 22186 |
| OES_fbo_render_mipmap | lib.dom.d.ts | 22194 |
| OES_standard_derivatives | lib.dom.d.ts | 22202 |
| OES_texture_float | lib.dom.d.ts | 22211 |
| OES_texture_float_linear | lib.dom.d.ts | 22219 |
| OES_texture_half_float | lib.dom.d.ts | 22227 |
| OES_texture_half_float_linear | lib.dom.d.ts | 22236 |
| OES_vertex_array_object | lib.dom.d.ts | 22244 |
| OVR_multiview2 | lib.dom.d.ts | 22277 |
| OfflineAudioCompletionEvent | lib.dom.d.ts | 22295 |
| OfflineAudioContextEventMap | lib.dom.d.ts | 22309 |
| OfflineAudioContext | lib.dom.d.ts | 22318 |
| OffscreenCanvasEventMap | lib.dom.d.ts | 22357 |
| OffscreenCanvas | lib.dom.d.ts | 22367 |
| OffscreenCanvasRenderingContext2D | lib.dom.d.ts | 22422 |
| OscillatorNode | lib.dom.d.ts | 22437 |
| OverconstrainedError | lib.dom.d.ts | 22478 |
| PageRevealEvent | lib.dom.d.ts | 22497 |
| PageSwapEvent | lib.dom.d.ts | 22516 |
| PageTransitionEvent | lib.dom.d.ts | 22541 |
| PannerNode | lib.dom.d.ts | 22560 |
| ParentNode | lib.dom.d.ts | 22666 |
| Path2D | lib.dom.d.ts | 22740 |
| PaymentAddress | lib.dom.d.ts | 22759 |
| PaymentMethodChangeEvent | lib.dom.d.ts | 22839 |
| PerformanceEventMap | lib.dom.d.ts | 23052 |
| Performance | lib.dom.d.ts | 23061 |
| PerformanceEntry | lib.dom.d.ts | 23172 |
| PerformanceEventTiming | lib.dom.d.ts | 23215 |
| PerformanceMark | lib.dom.d.ts | 23258 |
| PerformanceMeasure | lib.dom.d.ts | 23277 |
| PerformanceNavigation | lib.dom.d.ts | 23297 |
| PerformanceNavigationTiming | lib.dom.d.ts | 23340 |
| PerformanceObserver | lib.dom.d.ts | 23419 |
| PerformanceObserverEntryList | lib.dom.d.ts | 23456 |
| PerformancePaintTiming | lib.dom.d.ts | 23487 |
| PerformanceResourceTiming | lib.dom.d.ts | 23500 |
| PerformanceServerTiming | lib.dom.d.ts | 23633 |
| PerformanceTiming | lib.dom.d.ts | 23671 |
| PeriodicWave | lib.dom.d.ts | 23839 |
| PermissionStatusEventMap | lib.dom.d.ts | 23847 |
| PermissionStatus | lib.dom.d.ts | 23856 |
| Permissions | lib.dom.d.ts | 23887 |
| PictureInPictureEvent | lib.dom.d.ts | 23906 |
| PictureInPictureWindowEventMap | lib.dom.d.ts | 23920 |
| PictureInPictureWindow | lib.dom.d.ts | 23929 |
| Plugin | lib.dom.d.ts | 23961 |
| PluginArray | lib.dom.d.ts | 24004 |
| PointerEvent | lib.dom.d.ts | 24027 |
| PopStateEvent | lib.dom.d.ts | 24125 |
| PopoverInvokerElement | lib.dom.d.ts | 24145 |
| ProcessingInstruction | lib.dom.d.ts | 24157 |
| ProgressEvent | lib.dom.d.ts | 24177 |
| PromiseRejectionEvent | lib.dom.d.ts | 24209 |
| PublicKeyCredential | lib.dom.d.ts | 24235 |
| PushManager | lib.dom.d.ts | 24309 |
| PushSubscription | lib.dom.d.ts | 24347 |
| PushSubscriptionOptions | lib.dom.d.ts | 24397 |
| RTCCertificate | lib.dom.d.ts | 24422 |
| RTCDTMFSenderEventMap | lib.dom.d.ts | 24442 |
| RTCDTMFSender | lib.dom.d.ts | 24451 |
| RTCDTMFToneChangeEvent | lib.dom.d.ts | 24488 |
| RTCDataChannelEventMap | lib.dom.d.ts | 24502 |
| RTCDataChannel | lib.dom.d.ts | 24516 |
| RTCDataChannelEvent | lib.dom.d.ts | 24626 |
| RTCDtlsTransportEventMap | lib.dom.d.ts | 24640 |
| RTCDtlsTransport | lib.dom.d.ts | 24650 |
| RTCEncodedAudioFrame | lib.dom.d.ts | 24683 |
| RTCEncodedVideoFrame | lib.dom.d.ts | 24710 |
| RTCError | lib.dom.d.ts | 24743 |
| RTCErrorEvent | lib.dom.d.ts | 24786 |
| RTCIceCandidate | lib.dom.d.ts | 24805 |
| RTCIceCandidatePair | lib.dom.d.ts | 24904 |
| RTCIceTransportEventMap | lib.dom.d.ts | 24911 |
| RTCIceTransport | lib.dom.d.ts | 24922 |
| RTCPeerConnectionEventMap | lib.dom.d.ts | 24958 |
| RTCPeerConnection | lib.dom.d.ts | 24975 |
| RTCPeerConnectionIceErrorEvent | lib.dom.d.ts | 25200 |
| RTCPeerConnectionIceEvent | lib.dom.d.ts | 25223 |
| RTCRtpReceiver | lib.dom.d.ts | 25242 |
| RTCRtpScriptTransform | lib.dom.d.ts | 25309 |
| RTCRtpSender | lib.dom.d.ts | 25322 |
| RTCRtpTransceiver | lib.dom.d.ts | 25395 |
| RTCSctpTransportEventMap | lib.dom.d.ts | 25445 |
| RTCSctpTransport | lib.dom.d.ts | 25454 |
| RTCSessionDescription | lib.dom.d.ts | 25497 |
| RTCStatsReport | lib.dom.d.ts | 25528 |
| RTCTrackEvent | lib.dom.d.ts | 25542 |
| RadioNodeList | lib.dom.d.ts | 25579 |
| Range | lib.dom.d.ts | 25598 |
| ReadableByteStreamController | lib.dom.d.ts | 25764 |
| ReadableStream | lib.dom.d.ts | 25807 |
| ReadableStreamBYOBReader | lib.dom.d.ts | 25860 |
| ReadableStreamDefaultController | lib.dom.d.ts | 25916 |
| ReadableStreamDefaultReader | lib.dom.d.ts | 25953 |
| ReadableStreamGenericReader | lib.dom.d.ts | 25973 |
| RemotePlaybackEventMap | lib.dom.d.ts | 25980 |
| RemotePlayback | lib.dom.d.ts | 25991 |
| Report | lib.dom.d.ts | 26038 |
| ReportBody | lib.dom.d.ts | 26070 |
| ReportingObserver | lib.dom.d.ts | 26089 |
| ResizeObserver | lib.dom.d.ts | 26217 |
| ResizeObserverEntry | lib.dom.d.ts | 26248 |
| ResizeObserverSize | lib.dom.d.ts | 26291 |
| SVGAElement | lib.dom.d.ts | 26395 |
| SVGAngle | lib.dom.d.ts | 26421 |
| SVGAnimateElement | lib.dom.d.ts | 26480 |
| SVGAnimateMotionElement | lib.dom.d.ts | 26497 |
| SVGAnimateTransformElement | lib.dom.d.ts | 26514 |
| SVGAnimatedAngle | lib.dom.d.ts | 26531 |
| SVGAnimatedBoolean | lib.dom.d.ts | 26556 |
| SVGAnimatedEnumeration | lib.dom.d.ts | 26581 |
| SVGAnimatedInteger | lib.dom.d.ts | 26606 |
| SVGAnimatedLength | lib.dom.d.ts | 26631 |
| SVGAnimatedLengthList | lib.dom.d.ts | 26656 |
| SVGAnimatedNumber | lib.dom.d.ts | 26681 |
| SVGAnimatedNumberList | lib.dom.d.ts | 26706 |
| SVGAnimatedPoints | lib.dom.d.ts | 26726 |
| SVGAnimatedPreserveAspectRatio | lib.dom.d.ts | 26738 |
| SVGAnimatedRect | lib.dom.d.ts | 26763 |
| SVGAnimatedString | lib.dom.d.ts | 26788 |
| SVGAnimatedTransformList | lib.dom.d.ts | 26813 |
| SVGAnimationElement | lib.dom.d.ts | 26838 |
| SVGCircleElement | lib.dom.d.ts | 26903 |
| SVGClipPathElement | lib.dom.d.ts | 26938 |
| SVGDefsElement | lib.dom.d.ts | 27038 |
| SVGDescElement | lib.dom.d.ts | 27055 |
| SVGElementEventMap | lib.dom.d.ts | 27067 |
| SVGElement | lib.dom.d.ts | 27075 |
| SVGEllipseElement | lib.dom.d.ts | 27106 |
| SVGFEBlendElement | lib.dom.d.ts | 27147 |
| SVGFEColorMatrixElement | lib.dom.d.ts | 27216 |
| SVGFECompositeElement | lib.dom.d.ts | 27284 |
| SVGFEConvolveMatrixElement | lib.dom.d.ts | 27357 |
| SVGFEDiffuseLightingElement | lib.dom.d.ts | 27454 |
| SVGFEDisplacementMapElement | lib.dom.d.ts | 27501 |
| SVGFEDistantLightElement | lib.dom.d.ts | 27558 |
| SVGFEDropShadowElement | lib.dom.d.ts | 27587 |
| SVGFEFloodElement | lib.dom.d.ts | 27640 |
| SVGFEFuncAElement | lib.dom.d.ts | 27657 |
| SVGFEFuncBElement | lib.dom.d.ts | 27674 |
| SVGFEFuncGElement | lib.dom.d.ts | 27691 |
| SVGFEFuncRElement | lib.dom.d.ts | 27708 |
| SVGFEGaussianBlurElement | lib.dom.d.ts | 27725 |
| SVGFEImageElement | lib.dom.d.ts | 27766 |
| SVGFEMergeElement | lib.dom.d.ts | 27789 |
| SVGFEMergeNodeElement | lib.dom.d.ts | 27806 |
| SVGFEMorphologyElement | lib.dom.d.ts | 27829 |
| SVGFEOffsetElement | lib.dom.d.ts | 27876 |
| SVGFEPointLightElement | lib.dom.d.ts | 27911 |
| SVGFESpecularLightingElement | lib.dom.d.ts | 27946 |
| SVGFESpotLightElement | lib.dom.d.ts | 27999 |
| SVGFETileElement | lib.dom.d.ts | 28064 |
| SVGFETurbulenceElement | lib.dom.d.ts | 28087 |
| SVGFilterElement | lib.dom.d.ts | 28152 |
| SVGFilterPrimitiveStandardAttributes | lib.dom.d.ts | 28200 |
| SVGFitToViewBox | lib.dom.d.ts | 28213 |
| SVGForeignObjectElement | lib.dom.d.ts | 28225 |
| SVGGElement | lib.dom.d.ts | 28266 |
| SVGGeometryElement | lib.dom.d.ts | 28283 |
| SVGGradientElement | lib.dom.d.ts | 28330 |
| SVGGraphicsElement | lib.dom.d.ts | 28373 |
| SVGImageElement | lib.dom.d.ts | 28414 |
| SVGLength | lib.dom.d.ts | 28467 |
| SVGLengthList | lib.dom.d.ts | 28538 |
| SVGLineElement | lib.dom.d.ts | 28606 |
| SVGLinearGradientElement | lib.dom.d.ts | 28647 |
| SVGMPathElement | lib.dom.d.ts | 28688 |
| SVGMarkerElement | lib.dom.d.ts | 28705 |
| SVGMaskElement | lib.dom.d.ts | 28788 |
| SVGMetadataElement | lib.dom.d.ts | 28841 |
| SVGNumber | lib.dom.d.ts | 28858 |
| SVGNumberList | lib.dom.d.ts | 28877 |
| SVGPathElement | lib.dom.d.ts | 28945 |
| SVGPatternElement | lib.dom.d.ts | 28980 |
| SVGPointList | lib.dom.d.ts | 29039 |
| SVGPolygonElement | lib.dom.d.ts | 29107 |
| SVGPolylineElement | lib.dom.d.ts | 29124 |
| SVGPreserveAspectRatio | lib.dom.d.ts | 29141 |
| SVGRadialGradientElement | lib.dom.d.ts | 29194 |
| SVGRectElement | lib.dom.d.ts | 29247 |
| SVGSVGElementEventMap | lib.dom.d.ts | 29295 |
| SVGSVGElement | lib.dom.d.ts | 29303 |
| SVGScriptElement | lib.dom.d.ts | 29468 |
| SVGSetElement | lib.dom.d.ts | 29491 |
| SVGStopElement | lib.dom.d.ts | 29508 |
| SVGStringList | lib.dom.d.ts | 29531 |
| SVGStyleElement | lib.dom.d.ts | 29599 |
| SVGSwitchElement | lib.dom.d.ts | 29636 |
| SVGSymbolElement | lib.dom.d.ts | 29653 |
| SVGTSpanElement | lib.dom.d.ts | 29670 |
| SVGTests | lib.dom.d.ts | 29682 |
| SVGTextContentElement | lib.dom.d.ts | 29694 |
| SVGTextElement | lib.dom.d.ts | 29779 |
| SVGTextPathElement | lib.dom.d.ts | 29796 |
| SVGTextPositioningElement | lib.dom.d.ts | 29843 |
| SVGTitleElement | lib.dom.d.ts | 29890 |
| SVGTransform | lib.dom.d.ts | 29907 |
| SVGTransformList | lib.dom.d.ts | 29988 |
| SVGURIReference | lib.dom.d.ts | 30063 |
| SVGUnitTypes | lib.dom.d.ts | 30073 |
| SVGUseElement | lib.dom.d.ts | 30092 |
| SVGViewElement | lib.dom.d.ts | 30133 |
| Screen | lib.dom.d.ts | 30150 |
| ScreenOrientationEventMap | lib.dom.d.ts | 30200 |
| ScreenOrientation | lib.dom.d.ts | 30209 |
| ScriptProcessorNodeEventMap | lib.dom.d.ts | 30241 |
| ScriptProcessorNode | lib.dom.d.ts | 30251 |
| SecurityPolicyViolationEvent | lib.dom.d.ts | 30282 |
| Selection | lib.dom.d.ts | 30367 |
| ServiceWorkerEventMap | lib.dom.d.ts | 30520 |
| ServiceWorker | lib.dom.d.ts | 30530 |
| ServiceWorkerContainerEventMap | lib.dom.d.ts | 30563 |
| ServiceWorkerContainer | lib.dom.d.ts | 30575 |
| ServiceWorkerRegistrationEventMap | lib.dom.d.ts | 30629 |
| ServiceWorkerRegistration | lib.dom.d.ts | 30639 |
| ShadowRootEventMap | lib.dom.d.ts | 30725 |
| ShadowRoot | lib.dom.d.ts | 30734 |
| SharedWorker | lib.dom.d.ts | 30806 |
| Slottable | lib.dom.d.ts | 30824 |
| SourceBufferEventMap | lib.dom.d.ts | 30829 |
| SourceBuffer | lib.dom.d.ts | 30842 |
| SourceBufferListEventMap | lib.dom.d.ts | 30919 |
| SourceBufferList | lib.dom.d.ts | 30929 |
| SpeechRecognitionAlternative | lib.dom.d.ts | 30956 |
| SpeechRecognitionResult | lib.dom.d.ts | 30982 |
| SpeechRecognitionResultList | lib.dom.d.ts | 31015 |
| SpeechSynthesisEventMap | lib.dom.d.ts | 31036 |
| SpeechSynthesis | lib.dom.d.ts | 31045 |
| SpeechSynthesisErrorEvent | lib.dom.d.ts | 31112 |
| SpeechSynthesisEvent | lib.dom.d.ts | 31131 |
| SpeechSynthesisUtteranceEventMap | lib.dom.d.ts | 31169 |
| SpeechSynthesisUtterance | lib.dom.d.ts | 31184 |
| SpeechSynthesisVoice | lib.dom.d.ts | 31251 |
| StaticRange | lib.dom.d.ts | 31294 |
| StereoPannerNode | lib.dom.d.ts | 31307 |
| Storage | lib.dom.d.ts | 31326 |
| StorageEvent | lib.dom.d.ts | 31376 |
| StorageManager | lib.dom.d.ts | 31427 |
| StyleMedia | lib.dom.d.ts | 31460 |
| StylePropertyMap | lib.dom.d.ts | 31470 |
| StylePropertyMapReadOnly | lib.dom.d.ts | 31507 |
| StyleSheet | lib.dom.d.ts | 31545 |
| StyleSheetList | lib.dom.d.ts | 31601 |
| SubmitEvent | lib.dom.d.ts | 31627 |
| SubtleCrypto | lib.dom.d.ts | 31647 |
| Text | lib.dom.d.ts | 31738 |
| TextDecoder | lib.dom.d.ts | 31763 |
| TextDecoderCommon | lib.dom.d.ts | 31777 |
| TextDecoderStream | lib.dom.d.ts | 31803 |
| TextEncoder | lib.dom.d.ts | 31818 |
| TextEncoderCommon | lib.dom.d.ts | 31838 |
| TextEncoderStream | lib.dom.d.ts | 31852 |
| TextEvent | lib.dom.d.ts | 31868 |
| TextMetrics | lib.dom.d.ts | 31896 |
| TextTrackEventMap | lib.dom.d.ts | 31976 |
| TextTrack | lib.dom.d.ts | 31985 |
| TextTrackCueEventMap | lib.dom.d.ts | 32059 |
| TextTrackCue | lib.dom.d.ts | 32069 |
| TextTrackCueList | lib.dom.d.ts | 32120 |
| TextTrackListEventMap | lib.dom.d.ts | 32141 |
| TextTrackList | lib.dom.d.ts | 32152 |
| TimeRanges | lib.dom.d.ts | 32188 |
| ToggleEvent | lib.dom.d.ts | 32219 |
| Touch | lib.dom.d.ts | 32244 |
| TouchEvent | lib.dom.d.ts | 32329 |
| TouchList | lib.dom.d.ts | 32384 |
| TrackEvent | lib.dom.d.ts | 32410 |
| TransformStream | lib.dom.d.ts | 32429 |
| TransformStreamDefaultController | lib.dom.d.ts | 32454 |
| TransitionEvent | lib.dom.d.ts | 32491 |
| TreeWalker | lib.dom.d.ts | 32522 |
| UIEvent | lib.dom.d.ts | 32601 |
| URL | lib.dom.d.ts | 32640 |
| webkitURL | lib.dom.d.ts | 32751 |
| URLSearchParams | lib.dom.d.ts | 32759 |
| UserActivation | lib.dom.d.ts | 32822 |
| VTTCue | lib.dom.d.ts | 32847 |
| VTTRegion | lib.dom.d.ts | 32930 |
| ValidityState | lib.dom.d.ts | 32951 |
| VideoColorSpace | lib.dom.d.ts | 33030 |
| VideoDecoderEventMap | lib.dom.d.ts | 33068 |
| VideoDecoder | lib.dom.d.ts | 33078 |
| VideoEncoderEventMap | lib.dom.d.ts | 33140 |
| VideoEncoder | lib.dom.d.ts | 33150 |
| VideoFrame | lib.dom.d.ts | 33217 |
| VideoPlaybackQuality | lib.dom.d.ts | 33315 |
| ViewTransition | lib.dom.d.ts | 33353 |
| ViewTransitionTypeSet | lib.dom.d.ts | 33386 |
| VisualViewportEventMap | lib.dom.d.ts | 33395 |
| VisualViewport | lib.dom.d.ts | 33405 |
| WEBGL_color_buffer_float | lib.dom.d.ts | 33468 |
| WEBGL_compressed_texture_astc | lib.dom.d.ts | 33479 |
| WEBGL_compressed_texture_etc | lib.dom.d.ts | 33521 |
| WEBGL_compressed_texture_etc1 | lib.dom.d.ts | 33539 |
| WEBGL_compressed_texture_pvrtc | lib.dom.d.ts | 33548 |
| WEBGL_compressed_texture_s3tc | lib.dom.d.ts | 33560 |
| WEBGL_compressed_texture_s3tc_srgb | lib.dom.d.ts | 33572 |
| WEBGL_debug_renderer_info | lib.dom.d.ts | 33584 |
| WEBGL_debug_shaders | lib.dom.d.ts | 33594 |
| WEBGL_depth_texture | lib.dom.d.ts | 33608 |
| WEBGL_draw_buffers | lib.dom.d.ts | 33617 |
| WEBGL_lose_context | lib.dom.d.ts | 33665 |
| WEBGL_multi_draw | lib.dom.d.ts | 33685 |
| WakeLock | lib.dom.d.ts | 33718 |
| WakeLockSentinelEventMap | lib.dom.d.ts | 33732 |
| WakeLockSentinel | lib.dom.d.ts | 33742 |
| WaveShaperNode | lib.dom.d.ts | 33779 |
| WebGL2RenderingContext | lib.dom.d.ts | 33804 |
| WebGL2RenderingContextBase | lib.dom.d.ts | 34371 |
| WebGL2RenderingContextOverloads | lib.dom.d.ts | 34819 |
| WebGLActiveInfo | lib.dom.d.ts | 34878 |
| WebGLBuffer | lib.dom.d.ts | 34909 |
| WebGLContextEvent | lib.dom.d.ts | 34922 |
| WebGLFramebuffer | lib.dom.d.ts | 34941 |
| WebGLProgram | lib.dom.d.ts | 34954 |
| WebGLQuery | lib.dom.d.ts | 34967 |
| WebGLRenderbuffer | lib.dom.d.ts | 34980 |
| WebGLRenderingContext | lib.dom.d.ts | 34993 |
| WebGLRenderingContextBase | lib.dom.d.ts | 35298 |
| WebGLRenderingContextOverloads | lib.dom.d.ts | 35878 |
| WebGLSampler | lib.dom.d.ts | 35925 |
| WebGLShader | lib.dom.d.ts | 35938 |
| WebGLShaderPrecisionFormat | lib.dom.d.ts | 35951 |
| WebGLSync | lib.dom.d.ts | 35982 |
| WebGLTexture | lib.dom.d.ts | 35995 |
| WebGLTransformFeedback | lib.dom.d.ts | 36008 |
| WebGLUniformLocation | lib.dom.d.ts | 36021 |
| WebGLVertexArrayObject | lib.dom.d.ts | 36034 |
| WebGLVertexArrayObjectOES | lib.dom.d.ts | 36043 |
| WebSocketEventMap | lib.dom.d.ts | 36046 |
| WebSocket | lib.dom.d.ts | 36058 |
| WebTransport | lib.dom.d.ts | 36140 |
| WebTransportBidirectionalStream | lib.dom.d.ts | 36202 |
| WebTransportDatagramDuplexStream | lib.dom.d.ts | 36228 |
| WebTransportError | lib.dom.d.ts | 36280 |
| WheelEvent | lib.dom.d.ts | 36305 |
| WindowEventMap | lib.dom.d.ts | 36343 |
| Window | lib.dom.d.ts | 36358 |
| WindowEventHandlersEventMap | lib.dom.d.ts | 36807 |
| WindowEventHandlers | lib.dom.d.ts | 36830 |
| WindowLocalStorage | lib.dom.d.ts | 36881 |
| WindowOrWorkerGlobalScope | lib.dom.d.ts | 36886 |
| WindowSessionStorage | lib.dom.d.ts | 36930 |
| WorkerEventMap | lib.dom.d.ts | 36935 |
| Worker | lib.dom.d.ts | 36943 |
| Worklet | lib.dom.d.ts | 36974 |
| WritableStream | lib.dom.d.ts | 36993 |
| WritableStreamDefaultController | lib.dom.d.ts | 37030 |
| WritableStreamDefaultWriter | lib.dom.d.ts | 37055 |
| XMLDocument | lib.dom.d.ts | 37110 |
| XMLSerializer | lib.dom.d.ts | 37320 |
| XPathEvaluator | lib.dom.d.ts | 37339 |
| XPathEvaluatorBase | lib.dom.d.ts | 37347 |
| XPathExpression | lib.dom.d.ts | 37365 |
| XPathResult | lib.dom.d.ts | 37384 |
| XSLTProcessor | lib.dom.d.ts | 37471 |
| Console | lib.dom.d.ts | 37837 |
| AudioDataOutputCallback | lib.dom.d.ts | 37957 |
| BlobCallback | lib.dom.d.ts | 37961 |
| CustomElementConstructor | lib.dom.d.ts | 37965 |
| DecodeErrorCallback | lib.dom.d.ts | 37969 |
| DecodeSuccessCallback | lib.dom.d.ts | 37973 |
| EncodedAudioChunkOutputCallback | lib.dom.d.ts | 37977 |
| EncodedVideoChunkOutputCallback | lib.dom.d.ts | 37981 |
| ErrorCallback | lib.dom.d.ts | 37985 |
| FileCallback | lib.dom.d.ts | 37989 |
| FileSystemEntriesCallback | lib.dom.d.ts | 37993 |
| FileSystemEntryCallback | lib.dom.d.ts | 37997 |
| FunctionStringCallback | lib.dom.d.ts | 38005 |
| IntersectionObserverCallback | lib.dom.d.ts | 38013 |
| LockGrantedCallback | lib.dom.d.ts | 38017 |
| MediaSessionActionHandler | lib.dom.d.ts | 38021 |
| MutationCallback | lib.dom.d.ts | 38025 |
| NotificationPermissionCallback | lib.dom.d.ts | 38029 |
| OnBeforeUnloadEventHandlerNonNull | lib.dom.d.ts | 38033 |
| OnErrorEventHandlerNonNull | lib.dom.d.ts | 38037 |
| PerformanceObserverCallback | lib.dom.d.ts | 38041 |
| PositionCallback | lib.dom.d.ts | 38045 |
| PositionErrorCallback | lib.dom.d.ts | 38049 |
| QueuingStrategySize | lib.dom.d.ts | 38053 |
| RTCPeerConnectionErrorCallback | lib.dom.d.ts | 38057 |
| RTCSessionDescriptionCallback | lib.dom.d.ts | 38061 |
| RemotePlaybackAvailabilityCallback | lib.dom.d.ts | 38065 |
| ReportingObserverCallback | lib.dom.d.ts | 38069 |
| ResizeObserverCallback | lib.dom.d.ts | 38073 |
| TransformerFlushCallback | lib.dom.d.ts | 38077 |
| TransformerStartCallback | lib.dom.d.ts | 38081 |
| TransformerTransformCallback | lib.dom.d.ts | 38085 |
| UnderlyingSinkAbortCallback | lib.dom.d.ts | 38089 |
| UnderlyingSinkCloseCallback | lib.dom.d.ts | 38093 |
| UnderlyingSinkStartCallback | lib.dom.d.ts | 38097 |
| UnderlyingSinkWriteCallback | lib.dom.d.ts | 38101 |
| UnderlyingSourceCancelCallback | lib.dom.d.ts | 38105 |
| UnderlyingSourcePullCallback | lib.dom.d.ts | 38109 |
| UnderlyingSourceStartCallback | lib.dom.d.ts | 38113 |
| VideoFrameOutputCallback | lib.dom.d.ts | 38117 |
| ViewTransitionUpdateCallback | lib.dom.d.ts | 38125 |
| VoidFunction | lib.dom.d.ts | 38129 |
| WebCodecsErrorCallback | lib.dom.d.ts | 38133 |
| HTMLElementTagNameMap | lib.dom.d.ts | 38137 |
| HTMLElementDeprecatedTagNameMap | lib.dom.d.ts | 38252 |
| SVGElementTagNameMap | lib.dom.d.ts | 38284 |
| MathMLElementTagNameMap | lib.dom.d.ts | 38350 |
| ElementTagNameMap | lib.dom.d.ts | 38384 |
| AlgorithmIdentifier | lib.dom.d.ts | 39159 |
| AllowSharedBufferSource | lib.dom.d.ts | 39160 |
| AutoFill | lib.dom.d.ts | 39161 |
| AutoFillField | lib.dom.d.ts | 39162 |
| AutoFillSection | lib.dom.d.ts | 39163 |
| Base64URLString | lib.dom.d.ts | 39164 |
| BigInteger | lib.dom.d.ts | 39165 |
| BlobPart | lib.dom.d.ts | 39166 |
| BodyInit | lib.dom.d.ts | 39167 |
| BufferSource | lib.dom.d.ts | 39168 |
| COSEAlgorithmIdentifier | lib.dom.d.ts | 39169 |
| CSSKeywordish | lib.dom.d.ts | 39170 |
| CSSNumberish | lib.dom.d.ts | 39171 |
| CSSPerspectiveValue | lib.dom.d.ts | 39172 |
| CSSUnparsedSegment | lib.dom.d.ts | 39173 |
| CanvasImageSource | lib.dom.d.ts | 39174 |
| ClipboardItemData | lib.dom.d.ts | 39175 |
| ClipboardItems | lib.dom.d.ts | 39176 |
| ConstrainBoolean | lib.dom.d.ts | 39177 |
| ConstrainDOMString | lib.dom.d.ts | 39178 |
| ConstrainDouble | lib.dom.d.ts | 39179 |
| ConstrainULong | lib.dom.d.ts | 39180 |
| CookieList | lib.dom.d.ts | 39181 |
| DOMHighResTimeStamp | lib.dom.d.ts | 39182 |
| EpochTimeStamp | lib.dom.d.ts | 39183 |
| EventListenerOrEventListenerObject | lib.dom.d.ts | 39184 |
| FileSystemWriteChunkType | lib.dom.d.ts | 39185 |
| Float32List | lib.dom.d.ts | 39186 |
| GLbitfield | lib.dom.d.ts | 39188 |
| GLboolean | lib.dom.d.ts | 39189 |
| GLclampf | lib.dom.d.ts | 39190 |
| GLenum | lib.dom.d.ts | 39191 |
| GLfloat | lib.dom.d.ts | 39192 |
| GLint | lib.dom.d.ts | 39193 |
| GLint64 | lib.dom.d.ts | 39194 |
| GLintptr | lib.dom.d.ts | 39195 |
| GLsizei | lib.dom.d.ts | 39196 |
| GLsizeiptr | lib.dom.d.ts | 39197 |
| GLuint | lib.dom.d.ts | 39198 |
| GLuint64 | lib.dom.d.ts | 39199 |
| HTMLOrSVGImageElement | lib.dom.d.ts | 39200 |
| HTMLOrSVGScriptElement | lib.dom.d.ts | 39201 |
| HashAlgorithmIdentifier | lib.dom.d.ts | 39202 |
| HeadersInit | lib.dom.d.ts | 39203 |
| IDBValidKey | lib.dom.d.ts | 39204 |
| ImageBitmapSource | lib.dom.d.ts | 39205 |
| ImageBufferSource | lib.dom.d.ts | 39206 |
| ImageDataArray | lib.dom.d.ts | 39207 |
| Int32List | lib.dom.d.ts | 39208 |
| LineAndPositionSetting | lib.dom.d.ts | 39209 |
| MediaProvider | lib.dom.d.ts | 39210 |
| MessageEventSource | lib.dom.d.ts | 39211 |
| MutationRecordType | lib.dom.d.ts | 39212 |
| NamedCurve | lib.dom.d.ts | 39213 |
| OffscreenRenderingContext | lib.dom.d.ts | 39214 |
| OnBeforeUnloadEventHandler | lib.dom.d.ts | 39215 |
| OnErrorEventHandler | lib.dom.d.ts | 39216 |
| OptionalPostfixToken | lib.dom.d.ts | 39217 |
| OptionalPrefixToken | lib.dom.d.ts | 39218 |
| PerformanceEntryList | lib.dom.d.ts | 39219 |
| PublicKeyCredentialClientCapabilities | lib.dom.d.ts | 39220 |
| PublicKeyCredentialJSON | lib.dom.d.ts | 39221 |
| RTCRtpTransform | lib.dom.d.ts | 39222 |
| ReadableStreamController | lib.dom.d.ts | 39223 |
| ReadableStreamReadResult | lib.dom.d.ts | 39224 |
| ReadableStreamReader | lib.dom.d.ts | 39225 |
| RenderingContext | lib.dom.d.ts | 39226 |
| ReportList | lib.dom.d.ts | 39227 |
| TexImageSource | lib.dom.d.ts | 39229 |
| TimerHandler | lib.dom.d.ts | 39230 |
| Transferable | lib.dom.d.ts | 39231 |
| Uint32List | lib.dom.d.ts | 39232 |
| VibratePattern | lib.dom.d.ts | 39233 |
| WindowProxy | lib.dom.d.ts | 39234 |
| AlignSetting | lib.dom.d.ts | 39236 |
| AlphaOption | lib.dom.d.ts | 39237 |
| AnimationPlayState | lib.dom.d.ts | 39238 |
| AnimationReplaceState | lib.dom.d.ts | 39239 |
| AppendMode | lib.dom.d.ts | 39240 |
| AttestationConveyancePreference | lib.dom.d.ts | 39241 |
| AudioContextLatencyCategory | lib.dom.d.ts | 39242 |
| AudioContextState | lib.dom.d.ts | 39243 |
| AudioSampleFormat | lib.dom.d.ts | 39244 |
| AuthenticatorAttachment | lib.dom.d.ts | 39245 |
| AuthenticatorTransport | lib.dom.d.ts | 39246 |
| AutoFillAddressKind | lib.dom.d.ts | 39247 |
| AutoFillBase | lib.dom.d.ts | 39248 |
| AutoFillContactField | lib.dom.d.ts | 39249 |
| AutoFillContactKind | lib.dom.d.ts | 39250 |
| AutoFillCredentialField | lib.dom.d.ts | 39251 |
| AutoFillNormalField | lib.dom.d.ts | 39252 |
| AutoKeyword | lib.dom.d.ts | 39253 |
| AutomationRate | lib.dom.d.ts | 39254 |
| AvcBitstreamFormat | lib.dom.d.ts | 39255 |
| BinaryType | lib.dom.d.ts | 39256 |
| BiquadFilterType | lib.dom.d.ts | 39257 |
| BitrateMode | lib.dom.d.ts | 39258 |
| CSSMathOperator | lib.dom.d.ts | 39259 |
| CSSNumericBaseType | lib.dom.d.ts | 39260 |
| CanPlayTypeResult | lib.dom.d.ts | 39261 |
| CanvasDirection | lib.dom.d.ts | 39262 |
| CanvasFillRule | lib.dom.d.ts | 39263 |
| CanvasFontKerning | lib.dom.d.ts | 39264 |
| CanvasFontStretch | lib.dom.d.ts | 39265 |
| CanvasFontVariantCaps | lib.dom.d.ts | 39266 |
| CanvasLineCap | lib.dom.d.ts | 39267 |
| CanvasLineJoin | lib.dom.d.ts | 39268 |
| CanvasTextAlign | lib.dom.d.ts | 39269 |
| CanvasTextBaseline | lib.dom.d.ts | 39270 |
| CanvasTextRendering | lib.dom.d.ts | 39271 |
| ChannelCountMode | lib.dom.d.ts | 39272 |
| ChannelInterpretation | lib.dom.d.ts | 39273 |
| ClientTypes | lib.dom.d.ts | 39274 |
| CodecState | lib.dom.d.ts | 39275 |
| ColorGamut | lib.dom.d.ts | 39276 |
| ColorSpaceConversion | lib.dom.d.ts | 39277 |
| CompositeOperation | lib.dom.d.ts | 39278 |
| CompositeOperationOrAuto | lib.dom.d.ts | 39279 |
| CompressionFormat | lib.dom.d.ts | 39280 |
| CookieSameSite | lib.dom.d.ts | 39281 |
| CredentialMediationRequirement | lib.dom.d.ts | 39282 |
| DOMParserSupportedType | lib.dom.d.ts | 39283 |
| DirectionSetting | lib.dom.d.ts | 39284 |
| DisplayCaptureSurfaceType | lib.dom.d.ts | 39285 |
| DocumentReadyState | lib.dom.d.ts | 39287 |
| DocumentVisibilityState | lib.dom.d.ts | 39288 |
| EncodedAudioChunkType | lib.dom.d.ts | 39289 |
| EncodedVideoChunkType | lib.dom.d.ts | 39290 |
| EndOfStreamError | lib.dom.d.ts | 39291 |
| EndingType | lib.dom.d.ts | 39292 |
| FileSystemHandleKind | lib.dom.d.ts | 39293 |
| FillLightMode | lib.dom.d.ts | 39294 |
| FillMode | lib.dom.d.ts | 39295 |
| FontDisplay | lib.dom.d.ts | 39296 |
| FontFaceLoadStatus | lib.dom.d.ts | 39297 |
| FontFaceSetLoadStatus | lib.dom.d.ts | 39298 |
| FullscreenNavigationUI | lib.dom.d.ts | 39299 |
| GamepadHapticEffectType | lib.dom.d.ts | 39300 |
| GamepadHapticsResult | lib.dom.d.ts | 39301 |
| GamepadMappingType | lib.dom.d.ts | 39302 |
| GlobalCompositeOperation | lib.dom.d.ts | 39303 |
| HardwareAcceleration | lib.dom.d.ts | 39304 |
| HdrMetadataType | lib.dom.d.ts | 39305 |
| HighlightType | lib.dom.d.ts | 39306 |
| IDBCursorDirection | lib.dom.d.ts | 39307 |
| IDBTransactionDurability | lib.dom.d.ts | 39309 |
| IDBTransactionMode | lib.dom.d.ts | 39310 |
| ImageOrientation | lib.dom.d.ts | 39311 |
| ImageSmoothingQuality | lib.dom.d.ts | 39312 |
| InsertPosition | lib.dom.d.ts | 39313 |
| IterationCompositeOperation | lib.dom.d.ts | 39314 |
| KeyFormat | lib.dom.d.ts | 39315 |
| KeyType | lib.dom.d.ts | 39316 |
| KeyUsage | lib.dom.d.ts | 39317 |
| LatencyMode | lib.dom.d.ts | 39318 |
| LineAlignSetting | lib.dom.d.ts | 39319 |
| LockMode | lib.dom.d.ts | 39320 |
| LoginStatus | lib.dom.d.ts | 39321 |
| MIDIPortConnectionState | lib.dom.d.ts | 39322 |
| MIDIPortDeviceState | lib.dom.d.ts | 39323 |
| MIDIPortType | lib.dom.d.ts | 39324 |
| MediaDecodingType | lib.dom.d.ts | 39325 |
| MediaDeviceKind | lib.dom.d.ts | 39326 |
| MediaEncodingType | lib.dom.d.ts | 39327 |
| MediaKeyMessageType | lib.dom.d.ts | 39328 |
| MediaKeySessionClosedReason | lib.dom.d.ts | 39329 |
| MediaKeySessionType | lib.dom.d.ts | 39330 |
| MediaKeyStatus | lib.dom.d.ts | 39331 |
| MediaKeysRequirement | lib.dom.d.ts | 39332 |
| MediaSessionAction | lib.dom.d.ts | 39333 |
| MediaSessionPlaybackState | lib.dom.d.ts | 39334 |
| MediaStreamTrackState | lib.dom.d.ts | 39335 |
| NavigationTimingType | lib.dom.d.ts | 39336 |
| NavigationType | lib.dom.d.ts | 39337 |
| NotificationDirection | lib.dom.d.ts | 39338 |
| NotificationPermission | lib.dom.d.ts | 39339 |
| OffscreenRenderingContextId | lib.dom.d.ts | 39340 |
| OpusBitstreamFormat | lib.dom.d.ts | 39341 |
| OrientationType | lib.dom.d.ts | 39342 |
| OscillatorType | lib.dom.d.ts | 39343 |
| OverSampleType | lib.dom.d.ts | 39344 |
| PaymentComplete | lib.dom.d.ts | 39346 |
| PaymentShippingType | lib.dom.d.ts | 39347 |
| PermissionName | lib.dom.d.ts | 39348 |
| PermissionState | lib.dom.d.ts | 39349 |
| PlaybackDirection | lib.dom.d.ts | 39350 |
| PositionAlignSetting | lib.dom.d.ts | 39351 |
| PredefinedColorSpace | lib.dom.d.ts | 39352 |
| PremultiplyAlpha | lib.dom.d.ts | 39353 |
| PresentationStyle | lib.dom.d.ts | 39354 |
| PublicKeyCredentialType | lib.dom.d.ts | 39355 |
| PushEncryptionKeyName | lib.dom.d.ts | 39356 |
| RTCBundlePolicy | lib.dom.d.ts | 39357 |
| RTCDataChannelState | lib.dom.d.ts | 39358 |
| RTCDegradationPreference | lib.dom.d.ts | 39359 |
| RTCDtlsRole | lib.dom.d.ts | 39360 |
| RTCDtlsTransportState | lib.dom.d.ts | 39361 |
| RTCEncodedVideoFrameType | lib.dom.d.ts | 39362 |
| RTCErrorDetailType | lib.dom.d.ts | 39363 |
| RTCIceCandidateType | lib.dom.d.ts | 39364 |
| RTCIceConnectionState | lib.dom.d.ts | 39366 |
| RTCIceGathererState | lib.dom.d.ts | 39367 |
| RTCIceGatheringState | lib.dom.d.ts | 39368 |
| RTCIceProtocol | lib.dom.d.ts | 39369 |
| RTCIceRole | lib.dom.d.ts | 39370 |
| RTCIceTcpCandidateType | lib.dom.d.ts | 39371 |
| RTCIceTransportPolicy | lib.dom.d.ts | 39372 |
| RTCIceTransportState | lib.dom.d.ts | 39373 |
| RTCPeerConnectionState | lib.dom.d.ts | 39374 |
| RTCPriorityType | lib.dom.d.ts | 39375 |
| RTCQualityLimitationReason | lib.dom.d.ts | 39376 |
| RTCRtcpMuxPolicy | lib.dom.d.ts | 39377 |
| RTCRtpTransceiverDirection | lib.dom.d.ts | 39378 |
| RTCSctpTransportState | lib.dom.d.ts | 39379 |
| RTCSdpType | lib.dom.d.ts | 39380 |
| RTCSignalingState | lib.dom.d.ts | 39381 |
| RTCStatsIceCandidatePairState | lib.dom.d.ts | 39382 |
| RTCStatsType | lib.dom.d.ts | 39383 |
| ReadableStreamReaderMode | lib.dom.d.ts | 39384 |
| ReadableStreamType | lib.dom.d.ts | 39385 |
| ReadyState | lib.dom.d.ts | 39386 |
| RecordingState | lib.dom.d.ts | 39387 |
| RedEyeReduction | lib.dom.d.ts | 39388 |
| ReferrerPolicy | lib.dom.d.ts | 39389 |
| RemotePlaybackState | lib.dom.d.ts | 39390 |
| ResidentKeyRequirement | lib.dom.d.ts | 39397 |
| ResizeObserverBoxOptions | lib.dom.d.ts | 39398 |
| ResizeQuality | lib.dom.d.ts | 39399 |
| ScrollBehavior | lib.dom.d.ts | 39401 |
| ScrollLogicalPosition | lib.dom.d.ts | 39402 |
| ScrollRestoration | lib.dom.d.ts | 39403 |
| ScrollSetting | lib.dom.d.ts | 39404 |
| SecurityPolicyViolationEventDisposition | lib.dom.d.ts | 39405 |
| SelectionMode | lib.dom.d.ts | 39406 |
| ServiceWorkerState | lib.dom.d.ts | 39407 |
| ServiceWorkerUpdateViaCache | lib.dom.d.ts | 39408 |
| ShadowRootMode | lib.dom.d.ts | 39409 |
| SlotAssignmentMode | lib.dom.d.ts | 39410 |
| SpeechSynthesisErrorCode | lib.dom.d.ts | 39411 |
| TextTrackKind | lib.dom.d.ts | 39412 |
| TextTrackMode | lib.dom.d.ts | 39413 |
| TouchType | lib.dom.d.ts | 39414 |
| TransferFunction | lib.dom.d.ts | 39415 |
| UserVerificationRequirement | lib.dom.d.ts | 39416 |
| VideoColorPrimaries | lib.dom.d.ts | 39417 |
| VideoEncoderBitrateMode | lib.dom.d.ts | 39418 |
| VideoFacingModeEnum | lib.dom.d.ts | 39419 |
| VideoMatrixCoefficients | lib.dom.d.ts | 39420 |
| VideoPixelFormat | lib.dom.d.ts | 39421 |
| VideoTransferCharacteristics | lib.dom.d.ts | 39422 |
| WakeLockType | lib.dom.d.ts | 39423 |
| WebGLPowerPreference | lib.dom.d.ts | 39424 |
| WebTransportCongestionControl | lib.dom.d.ts | 39425 |
| WebTransportErrorSource | lib.dom.d.ts | 39426 |
| WorkerType | lib.dom.d.ts | 39427 |
| WriteCommandType | lib.dom.d.ts | 39428 |
| AudioParam | lib.dom.iterable.d.ts | 23 |
| AudioParamMap | lib.dom.iterable.d.ts | 32 |
| BaseAudioContext | lib.dom.iterable.d.ts | 35 |
| CSSKeyframesRule | lib.dom.iterable.d.ts | 50 |
| CSSNumericArray | lib.dom.iterable.d.ts | 54 |
| CSSRuleList | lib.dom.iterable.d.ts | 61 |
| CSSStyleDeclaration | lib.dom.iterable.d.ts | 65 |
| CSSTransformValue | lib.dom.iterable.d.ts | 69 |
| CSSUnparsedValue | lib.dom.iterable.d.ts | 76 |
| Cache | lib.dom.iterable.d.ts | 83 |
| CanvasPath | lib.dom.iterable.d.ts | 92 |
| CanvasPathDrawingStyles | lib.dom.iterable.d.ts | 97 |
| CookieStoreManager | lib.dom.iterable.d.ts | 102 |
| CustomStateSet | lib.dom.iterable.d.ts | 117 |
| DOMRectList | lib.dom.iterable.d.ts | 120 |
| DOMStringList | lib.dom.iterable.d.ts | 124 |
| DOMTokenList | lib.dom.iterable.d.ts | 128 |
| DataTransferItemList | lib.dom.iterable.d.ts | 135 |
| EventCounts | lib.dom.iterable.d.ts | 139 |
| FileList | lib.dom.iterable.d.ts | 142 |
| FontFaceSet | lib.dom.iterable.d.ts | 146 |
| HTMLAllCollection | lib.dom.iterable.d.ts | 163 |
| HTMLCollectionBase | lib.dom.iterable.d.ts | 167 |
| HTMLCollectionOf | lib.dom.iterable.d.ts | 171 |
| HTMLFormElement | lib.dom.iterable.d.ts | 175 |
| HTMLSelectElement | lib.dom.iterable.d.ts | 179 |
| HeadersIterator | lib.dom.iterable.d.ts | 183 |
| Headers | lib.dom.iterable.d.ts | 187 |
| Highlight | lib.dom.iterable.d.ts | 197 |
| HighlightRegistry | lib.dom.iterable.d.ts | 200 |
| IDBDatabase | lib.dom.iterable.d.ts | 203 |
| IDBObjectStore | lib.dom.iterable.d.ts | 212 |
| ImageTrackList | lib.dom.iterable.d.ts | 221 |
| MIDIOutput | lib.dom.iterable.d.ts | 228 |
| MIDIOutputMap | lib.dom.iterable.d.ts | 237 |
| MediaKeyStatusMapIterator | lib.dom.iterable.d.ts | 240 |
| MediaKeyStatusMap | lib.dom.iterable.d.ts | 244 |
| MediaList | lib.dom.iterable.d.ts | 251 |
| MessageEvent | lib.dom.iterable.d.ts | 255 |
| MimeTypeArray | lib.dom.iterable.d.ts | 260 |
| NamedNodeMap | lib.dom.iterable.d.ts | 264 |
| Navigator | lib.dom.iterable.d.ts | 268 |
| NodeList | lib.dom.iterable.d.ts | 284 |
| NodeListOf | lib.dom.iterable.d.ts | 294 |
| Plugin | lib.dom.iterable.d.ts | 304 |
| PluginArray | lib.dom.iterable.d.ts | 308 |
| RTCRtpTransceiver | lib.dom.iterable.d.ts | 312 |
| RTCStatsReport | lib.dom.iterable.d.ts | 321 |
| SVGLengthList | lib.dom.iterable.d.ts | 324 |
| SVGNumberList | lib.dom.iterable.d.ts | 328 |
| SVGPointList | lib.dom.iterable.d.ts | 332 |
| SVGStringList | lib.dom.iterable.d.ts | 336 |
| SVGTransformList | lib.dom.iterable.d.ts | 340 |
| SourceBufferList | lib.dom.iterable.d.ts | 344 |
| SpeechRecognitionResult | lib.dom.iterable.d.ts | 348 |
| SpeechRecognitionResultList | lib.dom.iterable.d.ts | 352 |
| StylePropertyMapReadOnlyIterator | lib.dom.iterable.d.ts | 356 |
| StylePropertyMapReadOnly | lib.dom.iterable.d.ts | 360 |
| StyleSheetList | lib.dom.iterable.d.ts | 367 |
| SubtleCrypto | lib.dom.iterable.d.ts | 371 |
| TextTrackCueList | lib.dom.iterable.d.ts | 402 |
| TextTrackList | lib.dom.iterable.d.ts | 406 |
| TouchList | lib.dom.iterable.d.ts | 410 |
| URLSearchParamsIterator | lib.dom.iterable.d.ts | 414 |
| URLSearchParams | lib.dom.iterable.d.ts | 418 |
| ViewTransitionTypeSet | lib.dom.iterable.d.ts | 428 |
| WEBGL_draw_buffers | lib.dom.iterable.d.ts | 431 |
| WEBGL_multi_draw | lib.dom.iterable.d.ts | 440 |
| WebGL2RenderingContextBase | lib.dom.iterable.d.ts | 467 |
| WebGL2RenderingContextOverloads | lib.dom.iterable.d.ts | 512 |
| WebGLRenderingContextBase | lib.dom.iterable.d.ts | 537 |
| WebGLRenderingContextOverloads | lib.dom.iterable.d.ts | 548 |
| FileSystemDirectoryHandleAsyncIterator | lib.dom.asynciterable.d.ts | 23 |
| FileSystemDirectoryHandle | lib.dom.asynciterable.d.ts | 27 |
| ReadableStreamAsyncIterator | lib.dom.asynciterable.d.ts | 34 |
| ReadableStream | lib.dom.asynciterable.d.ts | 38 |
| ActiveXObject | lib.scripthost.d.ts | 23 |
| ITextWriter | lib.scripthost.d.ts | 28 |
| TextStreamBase | lib.scripthost.d.ts | 34 |
| TextStreamWriter | lib.scripthost.d.ts | 53 |
| TextStreamReader | lib.scripthost.d.ts | 70 |
| SafeArray | lib.scripthost.d.ts | 227 |
| Enumerator | lib.scripthost.d.ts | 235 |
| EnumeratorConstructor | lib.scripthost.d.ts | 260 |
| VBArray | lib.scripthost.d.ts | 271 |
| VBArrayConstructor | lib.scripthost.d.ts | 302 |
| VarDate | lib.scripthost.d.ts | 311 |
| DateConstructor | lib.scripthost.d.ts | 316 |
| Date | lib.scripthost.d.ts | 320 |
| Array | lib.es2015.core.d.ts | 19 |
| ArrayConstructor | lib.es2015.core.d.ts | 67 |
| DateConstructor | lib.es2015.core.d.ts | 89 |
| Function | lib.es2015.core.d.ts | 93 |
| Math | lib.es2015.core.d.ts | 100 |
| NumberConstructor | lib.es2015.core.d.ts | 213 |
| ObjectConstructor | lib.es2015.core.d.ts | 279 |
| ReadonlyArray | lib.es2015.core.d.ts | 342 |
| RegExp | lib.es2015.core.d.ts | 369 |
| RegExpConstructor | lib.es2015.core.d.ts | 397 |
| String | lib.es2015.core.d.ts | 402 |
| StringConstructor | lib.es2015.core.d.ts | 544 |
| Int8Array | lib.es2015.core.d.ts | 563 |
| Uint8Array | lib.es2015.core.d.ts | 567 |
| Uint8ClampedArray | lib.es2015.core.d.ts | 571 |
| Int16Array | lib.es2015.core.d.ts | 575 |
| Uint16Array | lib.es2015.core.d.ts | 579 |
| Int32Array | lib.es2015.core.d.ts | 583 |
| Uint32Array | lib.es2015.core.d.ts | 587 |
| Float32Array | lib.es2015.core.d.ts | 591 |
| Float64Array | lib.es2015.core.d.ts | 595 |
| Map | lib.es2015.collection.d.ts | 19 |
| MapConstructor | lib.es2015.collection.d.ts | 48 |
| ReadonlyMap | lib.es2015.collection.d.ts | 55 |
| WeakMap | lib.es2015.collection.d.ts | 62 |
| WeakMapConstructor | lib.es2015.collection.d.ts | 83 |
| Set | lib.es2015.collection.d.ts | 89 |
| SetConstructor | lib.es2015.collection.d.ts | 115 |
| ReadonlySet | lib.es2015.collection.d.ts | 121 |
| WeakSet | lib.es2015.collection.d.ts | 127 |
| WeakSetConstructor | lib.es2015.collection.d.ts | 143 |
| Generator | lib.es2015.generator.d.ts | 21 |
| GeneratorFunction | lib.es2015.generator.d.ts | 29 |
| GeneratorFunctionConstructor | lib.es2015.generator.d.ts | 54 |
| SymbolConstructor | lib.es2015.iterable.d.ts | 21 |
| IteratorYieldResult | lib.es2015.iterable.d.ts | 29 |
| IteratorReturnResult | lib.es2015.iterable.d.ts | 34 |
| IteratorResult | lib.es2015.iterable.d.ts | 39 |
| Iterator | lib.es2015.iterable.d.ts | 41 |
| Iterable | lib.es2015.iterable.d.ts | 48 |
| IterableIterator | lib.es2015.iterable.d.ts | 55 |
| IteratorObject | lib.es2015.iterable.d.ts | 62 |
| BuiltinIteratorReturn | lib.es2015.iterable.d.ts | 70 |
| ArrayIterator | lib.es2015.iterable.d.ts | 72 |
| Array | lib.es2015.iterable.d.ts | 76 |
| ArrayConstructor | lib.es2015.iterable.d.ts | 96 |
| ReadonlyArray | lib.es2015.iterable.d.ts | 112 |
| IArguments | lib.es2015.iterable.d.ts | 132 |
| MapIterator | lib.es2015.iterable.d.ts | 137 |
| Map | lib.es2015.iterable.d.ts | 141 |
| ReadonlyMap | lib.es2015.iterable.d.ts | 161 |
| MapConstructor | lib.es2015.iterable.d.ts | 181 |
| WeakMap | lib.es2015.iterable.d.ts | 186 |
| WeakMapConstructor | lib.es2015.iterable.d.ts | 188 |
| SetIterator | lib.es2015.iterable.d.ts | 192 |
| Set | lib.es2015.iterable.d.ts | 196 |
| ReadonlySet | lib.es2015.iterable.d.ts | 216 |
| SetConstructor | lib.es2015.iterable.d.ts | 236 |
| WeakSet | lib.es2015.iterable.d.ts | 240 |
| WeakSetConstructor | lib.es2015.iterable.d.ts | 242 |
| Promise | lib.es2015.iterable.d.ts | 246 |
| PromiseConstructor | lib.es2015.iterable.d.ts | 248 |
| StringIterator | lib.es2015.iterable.d.ts | 266 |
| String | lib.es2015.iterable.d.ts | 270 |
| Int8Array | lib.es2015.iterable.d.ts | 275 |
| Int8ArrayConstructor | lib.es2015.iterable.d.ts | 294 |
| Uint8Array | lib.es2015.iterable.d.ts | 312 |
| Uint8ArrayConstructor | lib.es2015.iterable.d.ts | 331 |
| Uint8ClampedArray | lib.es2015.iterable.d.ts | 349 |
| Uint8ClampedArrayConstructor | lib.es2015.iterable.d.ts | 368 |
| Int16Array | lib.es2015.iterable.d.ts | 386 |
| Int16ArrayConstructor | lib.es2015.iterable.d.ts | 404 |
| Uint16Array | lib.es2015.iterable.d.ts | 422 |
| Uint16ArrayConstructor | lib.es2015.iterable.d.ts | 441 |
| Int32Array | lib.es2015.iterable.d.ts | 459 |
| Int32ArrayConstructor | lib.es2015.iterable.d.ts | 478 |
| Uint32Array | lib.es2015.iterable.d.ts | 496 |
| Uint32ArrayConstructor | lib.es2015.iterable.d.ts | 515 |
| Float32Array | lib.es2015.iterable.d.ts | 533 |
| Float32ArrayConstructor | lib.es2015.iterable.d.ts | 552 |
| Float64Array | lib.es2015.iterable.d.ts | 570 |
| Float64ArrayConstructor | lib.es2015.iterable.d.ts | 589 |
| PromiseConstructor | lib.es2015.promise.d.ts | 19 |
| ProxyHandler | lib.es2015.proxy.d.ts | 19 |
| ProxyConstructor | lib.es2015.proxy.d.ts | 111 |
| SymbolConstructor | lib.es2015.symbol.d.ts | 19 |
| SymbolConstructor | lib.es2015.symbol.wellknown.d.ts | 21 |
| Symbol | lib.es2015.symbol.wellknown.d.ts | 83 |
| Array | lib.es2015.symbol.wellknown.d.ts | 92 |
| ReadonlyArray | lib.es2015.symbol.wellknown.d.ts | 102 |
| Date | lib.es2015.symbol.wellknown.d.ts | 112 |
| Map | lib.es2015.symbol.wellknown.d.ts | 136 |
| WeakMap | lib.es2015.symbol.wellknown.d.ts | 140 |
| Set | lib.es2015.symbol.wellknown.d.ts | 144 |
| WeakSet | lib.es2015.symbol.wellknown.d.ts | 148 |
| JSON | lib.es2015.symbol.wellknown.d.ts | 152 |
| Function | lib.es2015.symbol.wellknown.d.ts | 156 |
| GeneratorFunction | lib.es2015.symbol.wellknown.d.ts | 167 |
| Math | lib.es2015.symbol.wellknown.d.ts | 171 |
| Promise | lib.es2015.symbol.wellknown.d.ts | 175 |
| PromiseConstructor | lib.es2015.symbol.wellknown.d.ts | 179 |
| RegExp | lib.es2015.symbol.wellknown.d.ts | 183 |
| RegExpConstructor | lib.es2015.symbol.wellknown.d.ts | 231 |
| String | lib.es2015.symbol.wellknown.d.ts | 235 |
| ArrayBuffer | lib.es2015.symbol.wellknown.d.ts | 271 |
| DataView | lib.es2015.symbol.wellknown.d.ts | 275 |
| Int8Array | lib.es2015.symbol.wellknown.d.ts | 279 |
| Uint8Array | lib.es2015.symbol.wellknown.d.ts | 283 |
| Uint8ClampedArray | lib.es2015.symbol.wellknown.d.ts | 287 |
| Int16Array | lib.es2015.symbol.wellknown.d.ts | 291 |
| Uint16Array | lib.es2015.symbol.wellknown.d.ts | 295 |
| Int32Array | lib.es2015.symbol.wellknown.d.ts | 299 |
| Uint32Array | lib.es2015.symbol.wellknown.d.ts | 303 |
| Float32Array | lib.es2015.symbol.wellknown.d.ts | 307 |
| Float64Array | lib.es2015.symbol.wellknown.d.ts | 311 |
| ArrayConstructor | lib.es2015.symbol.wellknown.d.ts | 315 |
| MapConstructor | lib.es2015.symbol.wellknown.d.ts | 318 |
| SetConstructor | lib.es2015.symbol.wellknown.d.ts | 321 |
| ArrayBufferConstructor | lib.es2015.symbol.wellknown.d.ts | 324 |
| Array | lib.es2016.array.include.d.ts | 19 |
| ReadonlyArray | lib.es2016.array.include.d.ts | 28 |
| Int8Array | lib.es2016.array.include.d.ts | 37 |
| Uint8Array | lib.es2016.array.include.d.ts | 46 |
| Uint8ClampedArray | lib.es2016.array.include.d.ts | 55 |
| Int16Array | lib.es2016.array.include.d.ts | 64 |
| Uint16Array | lib.es2016.array.include.d.ts | 73 |
| Int32Array | lib.es2016.array.include.d.ts | 82 |
| Uint32Array | lib.es2016.array.include.d.ts | 91 |
| Float32Array | lib.es2016.array.include.d.ts | 100 |
| Float64Array | lib.es2016.array.include.d.ts | 109 |
| ArrayBufferConstructor | lib.es2017.arraybuffer.d.ts | 19 |
| DateConstructor | lib.es2017.date.d.ts | 19 |
| ObjectConstructor | lib.es2017.object.d.ts | 19 |
| SharedArrayBuffer | lib.es2017.sharedmemory.d.ts | 22 |
| SharedArrayBufferConstructor | lib.es2017.sharedmemory.d.ts | 35 |
| ArrayBufferTypes | lib.es2017.sharedmemory.d.ts | 42 |
| Atomics | lib.es2017.sharedmemory.d.ts | 46 |
| String | lib.es2017.string.d.ts | 19 |
| Int8ArrayConstructor | lib.es2017.typedarrays.d.ts | 19 |
| Uint8ArrayConstructor | lib.es2017.typedarrays.d.ts | 23 |
| Uint8ClampedArrayConstructor | lib.es2017.typedarrays.d.ts | 27 |
| Int16ArrayConstructor | lib.es2017.typedarrays.d.ts | 31 |
| Uint16ArrayConstructor | lib.es2017.typedarrays.d.ts | 35 |
| Int32ArrayConstructor | lib.es2017.typedarrays.d.ts | 39 |
| Uint32ArrayConstructor | lib.es2017.typedarrays.d.ts | 43 |
| Float32ArrayConstructor | lib.es2017.typedarrays.d.ts | 47 |
| Float64ArrayConstructor | lib.es2017.typedarrays.d.ts | 51 |
| AsyncGenerator | lib.es2018.asyncgenerator.d.ts | 21 |
| AsyncGeneratorFunction | lib.es2018.asyncgenerator.d.ts | 29 |
| AsyncGeneratorFunctionConstructor | lib.es2018.asyncgenerator.d.ts | 54 |
| SymbolConstructor | lib.es2018.asynciterable.d.ts | 22 |
| AsyncIterator | lib.es2018.asynciterable.d.ts | 30 |
| AsyncIterable | lib.es2018.asynciterable.d.ts | 37 |
| AsyncIterableIterator | lib.es2018.asynciterable.d.ts | 44 |
| AsyncIteratorObject | lib.es2018.asynciterable.d.ts | 51 |
| Promise | lib.es2018.promise.d.ts | 22 |
| RegExpMatchArray | lib.es2018.regexp.d.ts | 19 |
| RegExpExecArray | lib.es2018.regexp.d.ts | 25 |
| RegExp | lib.es2018.regexp.d.ts | 31 |
| FlatArray | lib.es2019.array.d.ts | 19 |
| ReadonlyArray | lib.es2019.array.d.ts | 25 |
| Array | lib.es2019.array.d.ts | 53 |
| ObjectConstructor | lib.es2019.object.d.ts | 21 |
| String | lib.es2019.string.d.ts | 19 |
| Symbol | lib.es2019.symbol.d.ts | 19 |
| BigIntToLocaleStringOptions | lib.es2020.bigint.d.ts | 21 |
| BigInt | lib.es2020.bigint.d.ts | 107 |
| BigIntConstructor | lib.es2020.bigint.d.ts | 123 |
| BigInt64Array | lib.es2020.bigint.d.ts | 149 |
| BigInt64ArrayConstructor | lib.es2020.bigint.d.ts | 389 |
| BigUint64Array | lib.es2020.bigint.d.ts | 440 |
| BigUint64ArrayConstructor | lib.es2020.bigint.d.ts | 680 |
| DataView | lib.es2020.bigint.d.ts | 727 |
| Date | lib.es2020.date.d.ts | 21 |
| PromiseFulfilledResult | lib.es2020.promise.d.ts | 19 |
| PromiseRejectedResult | lib.es2020.promise.d.ts | 24 |
| PromiseSettledResult | lib.es2020.promise.d.ts | 29 |
| PromiseConstructor | lib.es2020.promise.d.ts | 31 |
| Atomics | lib.es2020.sharedmemory.d.ts | 21 |
| String | lib.es2020.string.d.ts | 23 |
| SymbolConstructor | lib.es2020.symbol.wellknown.d.ts | 22 |
| RegExpStringIterator | lib.es2020.symbol.wellknown.d.ts | 30 |
| RegExp | lib.es2020.symbol.wellknown.d.ts | 34 |
| Number | lib.es2020.number.d.ts | 21 |
| SymbolConstructor | lib.esnext.disposable.d.ts | 23 |
| Disposable | lib.esnext.disposable.d.ts | 35 |
| AsyncDisposable | lib.esnext.disposable.d.ts | 39 |
| SuppressedError | lib.esnext.disposable.d.ts | 43 |
| SuppressedErrorConstructor | lib.esnext.disposable.d.ts | 48 |
| DisposableStack | lib.esnext.disposable.d.ts | 55 |
| DisposableStackConstructor | lib.esnext.disposable.d.ts | 116 |
| AsyncDisposableStack | lib.esnext.disposable.d.ts | 122 |
| AsyncDisposableStackConstructor | lib.esnext.disposable.d.ts | 183 |
| IteratorObject | lib.esnext.disposable.d.ts | 189 |
| AsyncIteratorObject | lib.esnext.disposable.d.ts | 192 |
| ClassMemberDecoratorContext | lib.decorators.d.ts | 22 |
| DecoratorContext | lib.decorators.d.ts | 32 |
| DecoratorMetadataObject | lib.decorators.d.ts | 36 |
| DecoratorMetadata | lib.decorators.d.ts | 38 |
| ClassDecoratorContext | lib.decorators.d.ts | 44 |
| ClassMethodDecoratorContext | lib.decorators.d.ts | 81 |
| ClassGetterDecoratorContext | lib.decorators.d.ts | 147 |
| ClassSetterDecoratorContext | lib.decorators.d.ts | 194 |
| ClassAccessorDecoratorContext | lib.decorators.d.ts | 241 |
| ClassAccessorDecoratorTarget | lib.decorators.d.ts | 295 |
| ClassAccessorDecoratorResult | lib.decorators.d.ts | 318 |
| ClassFieldDecoratorContext | lib.decorators.d.ts | 343 |
| ClassDecorator | lib.decorators.legacy.d.ts | 19 |
| PropertyDecorator | lib.decorators.legacy.d.ts | 20 |
| MethodDecorator | lib.decorators.legacy.d.ts | 21 |
| ParameterDecorator | lib.decorators.legacy.d.ts | 22 |
| CompanySettings | company.ts | 8 |
| Company | company.ts | 19 |
| CompanyInfo | company.ts | 36 |
| JSONType | util.d.cts | 5 |
| JWTAlgorithm | util.d.cts | 8 |
| HashAlgorithm | util.d.cts | 9 |
| HashEncoding | util.d.cts | 10 |
| HashFormat | util.d.cts | 11 |
| IPVersion | util.d.cts | 12 |
| MimeTypes | util.d.cts | 13 |
| ParsedTypes | util.d.cts | 14 |
| AssertEqual | util.d.cts | 15 |
| AssertNotEqual | util.d.cts | 16 |
| AssertExtends | util.d.cts | 17 |
| IsAny | util.d.cts | 18 |
| Omit | util.d.cts | 19 |
| OmitKeys | util.d.cts | 20 |
| MakePartial | util.d.cts | 21 |
| MakeRequired | util.d.cts | 22 |
| Exactly | util.d.cts | 23 |
| NoUndefined | util.d.cts | 24 |
| Whatever | util.d.cts | 25 |
| LoosePartial | util.d.cts | 26 |
| Mask | util.d.cts | 29 |
| Writeable | util.d.cts | 32 |
| InexactPartial | util.d.cts | 35 |
| EmptyObject | util.d.cts | 38 |
| BuiltIn | util.d.cts | 39 |
| MakeReadonly | util.d.cts | 42 |
| SomeObject | util.d.cts | 43 |
| Flatten | util.d.cts | 45 |
| Mapped | util.d.cts | 48 |
| Prettify | util.d.cts | 51 |
| NoNeverKeys | util.d.cts | 54 |
| NoNever | util.d.cts | 57 |
| Extend | util.d.cts | 60 |
| TupleItems | util.d.cts | 65 |
| AnyFunc | util.d.cts | 66 |
| IsProp | util.d.cts | 67 |
| MaybeAsync | util.d.cts | 68 |
| KeyOf | util.d.cts | 69 |
| OmitIndexSignature | util.d.cts | 70 |
| ExtractIndexSignature | util.d.cts | 73 |
| Keys | util.d.cts | 76 |
| EnumValue | util.d.cts | 80 |
| EnumLike | util.d.cts | 81 |
| ToEnum | util.d.cts | 82 |
| KeysEnum | util.d.cts | 85 |
| KeysArray | util.d.cts | 86 |
| Literal | util.d.cts | 87 |
| LiteralArray | util.d.cts | 88 |
| Primitive | util.d.cts | 89 |
| PrimitiveArray | util.d.cts | 90 |
| HasSize | util.d.cts | 91 |
| HasLength | util.d.cts | 94 |
| Numeric | util.d.cts | 97 |
| SafeParseResult | util.d.cts | 98 |
| SafeParseSuccess | util.d.cts | 99 |
| SafeParseError | util.d.cts | 104 |
| PropValues | util.d.cts | 109 |
| PrimitiveSet | util.d.cts | 110 |
| EmptyToNever | util.d.cts | 151 |
| Normalize | util.d.cts | 152 |
| CleanKey | util.d.cts | 161 |
| ToCleanMap | util.d.cts | 162 |
| FromCleanMap | util.d.cts | 165 |
| Constructor | util.d.cts | 177 |
| Class | util.d.cts | 195 |
| ParseContext | schemas.d.cts | 7 |
| ParseContextInternal | schemas.d.cts | 16 |
| ParsePayload | schemas.d.cts | 21 |
| CheckFn | schemas.d.cts | 27 |
| $ZodTypeDef | schemas.d.cts | 28 |
| _$ZodTypeInternals | schemas.d.cts | 33 |
| $ZodTypeInternals | schemas.d.cts | 78 |
| SomeType | schemas.d.cts | 85 |
| $ZodType | schemas.d.cts | 88 |
| _$ZodType | schemas.d.cts | 92 |
| $ZodStringDef | schemas.d.cts | 96 |
| $ZodStringInternals | schemas.d.cts | 101 |
| $ZodString | schemas.d.cts | 115 |
| $ZodStringFormatDef | schemas.d.cts | 118 |
| $ZodStringFormatInternals | schemas.d.cts | 120 |
| $ZodStringFormat | schemas.d.cts | 123 |
| $ZodGUIDDef | schemas.d.cts | 127 |
| $ZodGUIDInternals | schemas.d.cts | 129 |
| $ZodGUID | schemas.d.cts | 131 |
| $ZodUUIDDef | schemas.d.cts | 135 |
| $ZodUUIDInternals | schemas.d.cts | 138 |
| $ZodUUID | schemas.d.cts | 141 |
| $ZodEmailDef | schemas.d.cts | 145 |
| $ZodEmailInternals | schemas.d.cts | 147 |
| $ZodEmail | schemas.d.cts | 149 |
| $ZodURLDef | schemas.d.cts | 153 |
| $ZodURLInternals | schemas.d.cts | 158 |
| $ZodURL | schemas.d.cts | 161 |
| $ZodEmojiDef | schemas.d.cts | 165 |
| $ZodEmojiInternals | schemas.d.cts | 167 |
| $ZodEmoji | schemas.d.cts | 169 |
| $ZodNanoIDDef | schemas.d.cts | 173 |
| $ZodNanoIDInternals | schemas.d.cts | 175 |
| $ZodNanoID | schemas.d.cts | 177 |
| $ZodCUIDDef | schemas.d.cts | 181 |
| $ZodCUIDInternals | schemas.d.cts | 183 |
| $ZodCUID | schemas.d.cts | 185 |
| $ZodCUID2Def | schemas.d.cts | 189 |
| $ZodCUID2Internals | schemas.d.cts | 191 |
| $ZodCUID2 | schemas.d.cts | 193 |
| $ZodULIDDef | schemas.d.cts | 197 |
| $ZodULIDInternals | schemas.d.cts | 199 |
| $ZodULID | schemas.d.cts | 201 |
| $ZodXIDDef | schemas.d.cts | 205 |
| $ZodXIDInternals | schemas.d.cts | 207 |
| $ZodXID | schemas.d.cts | 209 |
| $ZodKSUIDDef | schemas.d.cts | 213 |
| $ZodKSUIDInternals | schemas.d.cts | 215 |
| $ZodKSUID | schemas.d.cts | 217 |
| $ZodISODateTimeDef | schemas.d.cts | 221 |
| $ZodISODateTimeInternals | schemas.d.cts | 226 |
| $ZodISODateTime | schemas.d.cts | 229 |
| $ZodISODateDef | schemas.d.cts | 233 |
| $ZodISODateInternals | schemas.d.cts | 235 |
| $ZodISODate | schemas.d.cts | 237 |
| $ZodISOTimeDef | schemas.d.cts | 241 |
| $ZodISOTimeInternals | schemas.d.cts | 244 |
| $ZodISOTime | schemas.d.cts | 247 |
| $ZodISODurationDef | schemas.d.cts | 251 |
| $ZodISODurationInternals | schemas.d.cts | 253 |
| $ZodISODuration | schemas.d.cts | 255 |
| $ZodIPv4Def | schemas.d.cts | 259 |
| $ZodIPv4Internals | schemas.d.cts | 262 |
| $ZodIPv4 | schemas.d.cts | 265 |
| $ZodIPv6Def | schemas.d.cts | 269 |
| $ZodIPv6Internals | schemas.d.cts | 272 |
| $ZodIPv6 | schemas.d.cts | 275 |
| $ZodCIDRv4Def | schemas.d.cts | 279 |
| $ZodCIDRv4Internals | schemas.d.cts | 282 |
| $ZodCIDRv4 | schemas.d.cts | 285 |
| $ZodCIDRv6Def | schemas.d.cts | 289 |
| $ZodCIDRv6Internals | schemas.d.cts | 292 |
| $ZodCIDRv6 | schemas.d.cts | 295 |
| $ZodBase64Def | schemas.d.cts | 300 |
| $ZodBase64Internals | schemas.d.cts | 302 |
| $ZodBase64 | schemas.d.cts | 304 |
| $ZodBase64URLDef | schemas.d.cts | 309 |
| $ZodBase64URLInternals | schemas.d.cts | 311 |
| $ZodBase64URL | schemas.d.cts | 313 |
| $ZodE164Def | schemas.d.cts | 317 |
| $ZodE164Internals | schemas.d.cts | 319 |
| $ZodE164 | schemas.d.cts | 321 |
| $ZodJWTDef | schemas.d.cts | 326 |
| $ZodJWTInternals | schemas.d.cts | 329 |
| $ZodJWT | schemas.d.cts | 332 |
| $ZodCustomStringFormatDef | schemas.d.cts | 336 |
| $ZodCustomStringFormatInternals | schemas.d.cts | 339 |
| $ZodCustomStringFormat | schemas.d.cts | 342 |
| $ZodNumberDef | schemas.d.cts | 346 |
| $ZodNumberInternals | schemas.d.cts | 350 |
| $ZodNumber | schemas.d.cts | 365 |
| $ZodNumberFormatDef | schemas.d.cts | 369 |
| $ZodNumberFormatInternals | schemas.d.cts | 371 |
| $ZodNumberFormat | schemas.d.cts | 375 |
| $ZodBooleanDef | schemas.d.cts | 379 |
| $ZodBooleanInternals | schemas.d.cts | 384 |
| $ZodBoolean | schemas.d.cts | 389 |
| $ZodBigIntDef | schemas.d.cts | 393 |
| $ZodBigIntInternals | schemas.d.cts | 397 |
| $ZodBigInt | schemas.d.cts | 408 |
| $ZodBigIntFormatDef | schemas.d.cts | 412 |
| $ZodBigIntFormatInternals | schemas.d.cts | 415 |
| $ZodBigIntFormat | schemas.d.cts | 418 |
| $ZodSymbolDef | schemas.d.cts | 422 |
| $ZodSymbolInternals | schemas.d.cts | 425 |
| $ZodSymbol | schemas.d.cts | 429 |
| $ZodUndefinedDef | schemas.d.cts | 433 |
| $ZodUndefinedInternals | schemas.d.cts | 436 |
| $ZodUndefined | schemas.d.cts | 442 |
| $ZodNullDef | schemas.d.cts | 446 |
| $ZodNullInternals | schemas.d.cts | 449 |
| $ZodNull | schemas.d.cts | 455 |
| $ZodAnyDef | schemas.d.cts | 459 |
| $ZodAnyInternals | schemas.d.cts | 462 |
| $ZodAny | schemas.d.cts | 466 |
| $ZodUnknownDef | schemas.d.cts | 470 |
| $ZodUnknownInternals | schemas.d.cts | 473 |
| $ZodUnknown | schemas.d.cts | 477 |
| $ZodNeverDef | schemas.d.cts | 481 |
| $ZodNeverInternals | schemas.d.cts | 484 |
| $ZodNever | schemas.d.cts | 488 |
| $ZodVoidDef | schemas.d.cts | 492 |
| $ZodVoidInternals | schemas.d.cts | 495 |
| $ZodVoid | schemas.d.cts | 499 |
| $ZodDateDef | schemas.d.cts | 503 |
| $ZodDateInternals | schemas.d.cts | 507 |
| $ZodDate | schemas.d.cts | 516 |
| $ZodArrayDef | schemas.d.cts | 520 |
| $ZodArrayInternals | schemas.d.cts | 524 |
| $ZodArray | schemas.d.cts | 530 |
| $InferObjectOutput | schemas.d.cts | 543 |
| $ZodObjectConfig | schemas.d.cts | 553 |
| $loose | schemas.d.cts | 557 |
| $strict | schemas.d.cts | 561 |
| $strip | schemas.d.cts | 565 |
| $catchall | schemas.d.cts | 569 |
| $ZodShape | schemas.d.cts | 577 |
| $ZodObjectDef | schemas.d.cts | 580 |
| $ZodObjectInternals | schemas.d.cts | 585 |
| $ZodLooseShape | schemas.d.cts | 597 |
| $ZodObject | schemas.d.cts | 598 |
| $InferUnionOutput | schemas.d.cts | 605 |
| $ZodUnionDef | schemas.d.cts | 607 |
| IsOptionalIn | schemas.d.cts | 611 |
| IsOptionalOut | schemas.d.cts | 612 |
| $ZodUnionInternals | schemas.d.cts | 613 |
| $ZodUnion | schemas.d.cts | 623 |
| $ZodDiscriminatedUnionDef | schemas.d.cts | 627 |
| $ZodDiscriminatedUnionInternals | schemas.d.cts | 631 |
| $ZodDiscriminatedUnion | schemas.d.cts | 635 |
| $ZodIntersectionDef | schemas.d.cts | 639 |
| $ZodIntersectionInternals | schemas.d.cts | 644 |
| $ZodIntersection | schemas.d.cts | 652 |
| $ZodTupleDef | schemas.d.cts | 656 |
| $InferTupleOutputType | schemas.d.cts | 672 |
| TupleOutputTypeNoOptionals | schemas.d.cts | 676 |
| TupleOutputTypeWithOptionals | schemas.d.cts | 679 |
| $ZodTupleInternals | schemas.d.cts | 683 |
| $ZodTuple | schemas.d.cts | 689 |
| $ZodRecordKey | schemas.d.cts | 693 |
| $ZodRecordDef | schemas.d.cts | 694 |
| $InferZodRecordOutput | schemas.d.cts | 699 |
| $ZodRecordInternals | schemas.d.cts | 701 |
| $partial | schemas.d.cts | 707 |
| $ZodRecord | schemas.d.cts | 710 |
| $ZodMapDef | schemas.d.cts | 714 |
| $ZodMapInternals | schemas.d.cts | 719 |
| $ZodMap | schemas.d.cts | 725 |
| $ZodSetDef | schemas.d.cts | 729 |
| $ZodSetInternals | schemas.d.cts | 733 |
| $ZodSet | schemas.d.cts | 739 |
| $InferEnumOutput | schemas.d.cts | 743 |
| $ZodEnumDef | schemas.d.cts | 745 |
| $ZodEnumInternals | schemas.d.cts | 749 |
| $ZodEnum | schemas.d.cts | 759 |
| $ZodLiteralDef | schemas.d.cts | 763 |
| $ZodLiteralInternals | schemas.d.cts | 767 |
| $ZodLiteral | schemas.d.cts | 773 |
| _File | schemas.d.cts | 777 |
| File | schemas.d.cts | 781 |
| $ZodFileDef | schemas.d.cts | 785 |
| $ZodFileInternals | schemas.d.cts | 788 |
| $ZodFile | schemas.d.cts | 797 |
| $ZodTransformDef | schemas.d.cts | 801 |
| $ZodTransformInternals | schemas.d.cts | 805 |
| $ZodTransform | schemas.d.cts | 809 |
| $ZodOptionalDef | schemas.d.cts | 813 |
| $ZodOptionalInternals | schemas.d.cts | 817 |
| $ZodOptional | schemas.d.cts | 825 |
| $ZodNullableDef | schemas.d.cts | 829 |
| $ZodNullableInternals | schemas.d.cts | 833 |
| $ZodNullable | schemas.d.cts | 841 |
| $ZodDefaultDef | schemas.d.cts | 845 |
| $ZodDefaultInternals | schemas.d.cts | 851 |
| $ZodDefault | schemas.d.cts | 858 |
| $ZodPrefaultDef | schemas.d.cts | 862 |
| $ZodPrefaultInternals | schemas.d.cts | 868 |
| $ZodPrefault | schemas.d.cts | 875 |
| $ZodNonOptionalDef | schemas.d.cts | 879 |
| $ZodNonOptionalInternals | schemas.d.cts | 883 |
| $ZodNonOptional | schemas.d.cts | 890 |
| $ZodSuccessDef | schemas.d.cts | 894 |
| $ZodSuccessInternals | schemas.d.cts | 898 |
| $ZodSuccess | schemas.d.cts | 904 |
| $ZodCatchCtx | schemas.d.cts | 908 |
| $ZodCatchDef | schemas.d.cts | 916 |
| $ZodCatchInternals | schemas.d.cts | 921 |
| $ZodCatch | schemas.d.cts | 928 |
| $ZodNaNDef | schemas.d.cts | 932 |
| $ZodNaNInternals | schemas.d.cts | 935 |
| $ZodNaN | schemas.d.cts | 939 |
| $ZodPipeDef | schemas.d.cts | 943 |
| $ZodPipeInternals | schemas.d.cts | 952 |
| $ZodPipe | schemas.d.cts | 960 |
| $ZodCodecDef | schemas.d.cts | 964 |
| $ZodCodecInternals | schemas.d.cts | 968 |
| $ZodCodec | schemas.d.cts | 976 |
| $ZodReadonlyDef | schemas.d.cts | 980 |
| $ZodReadonlyInternals | schemas.d.cts | 984 |
| $ZodReadonly | schemas.d.cts | 992 |
| $ZodTemplateLiteralDef | schemas.d.cts | 996 |
| $ZodTemplateLiteralInternals | schemas.d.cts | 1001 |
| $ZodTemplateLiteral | schemas.d.cts | 1006 |
| LiteralPart | schemas.d.cts | 1009 |
| $ZodTemplateLiteralPart | schemas.d.cts | 1016 |
| UndefinedToEmptyString | schemas.d.cts | 1017 |
| AppendToTemplateLiteral | schemas.d.cts | 1018 |
| ConcatenateTupleOfStrings | schemas.d.cts | 1019 |
| ConvertPartsToStringTuple | schemas.d.cts | 1023 |
| ToTemplateLiteral | schemas.d.cts | 1026 |
| $PartsToTemplateLiteral | schemas.d.cts | 1027 |
| $ZodFunctionArgs | schemas.d.cts | 1029 |
| $ZodFunctionIn | schemas.d.cts | 1030 |
| $ZodFunctionOut | schemas.d.cts | 1031 |
| $InferInnerFunctionType | schemas.d.cts | 1032 |
| $InferInnerFunctionTypeAsync | schemas.d.cts | 1033 |
| $InferOuterFunctionType | schemas.d.cts | 1034 |
| $InferOuterFunctionTypeAsync | schemas.d.cts | 1035 |
| $ZodFunctionDef | schemas.d.cts | 1036 |
| $ZodFunctionInternals | schemas.d.cts | 1041 |
| $ZodFunction | schemas.d.cts | 1045 |
| $ZodFunctionParams | schemas.d.cts | 1057 |
| $ZodPromiseDef | schemas.d.cts | 1062 |
| $ZodPromiseInternals | schemas.d.cts | 1066 |
| $ZodPromise | schemas.d.cts | 1070 |
| $ZodLazyDef | schemas.d.cts | 1074 |
| $ZodLazyInternals | schemas.d.cts | 1078 |
| $ZodLazy | schemas.d.cts | 1088 |
| $ZodCustomDef | schemas.d.cts | 1092 |
| $ZodCustomInternals | schemas.d.cts | 1100 |
| $ZodCustom | schemas.d.cts | 1108 |
| $ZodTypes | schemas.d.cts | 1112 |
| $ZodStringFormatTypes | schemas.d.cts | 1113 |
| $ZodCheckDef | checks.d.cts | 5 |
| $ZodCheckInternals | checks.d.cts | 13 |
| $ZodCheck | checks.d.cts | 20 |
| $ZodCheckLessThanDef | checks.d.cts | 24 |
| $ZodCheckLessThanInternals | checks.d.cts | 29 |
| $ZodCheckLessThan | checks.d.cts | 33 |
| $ZodCheckGreaterThanDef | checks.d.cts | 37 |
| $ZodCheckGreaterThanInternals | checks.d.cts | 42 |
| $ZodCheckGreaterThan | checks.d.cts | 46 |
| $ZodCheckMultipleOfDef | checks.d.cts | 50 |
| $ZodCheckMultipleOfInternals | checks.d.cts | 54 |
| $ZodCheckMultipleOf | checks.d.cts | 58 |
| $ZodNumberFormats | checks.d.cts | 62 |
| $ZodCheckNumberFormatDef | checks.d.cts | 63 |
| $ZodCheckNumberFormatInternals | checks.d.cts | 67 |
| $ZodCheckNumberFormat | checks.d.cts | 71 |
| $ZodBigIntFormats | checks.d.cts | 75 |
| $ZodCheckBigIntFormatDef | checks.d.cts | 76 |
| $ZodCheckBigIntFormatInternals | checks.d.cts | 80 |
| $ZodCheckBigIntFormat | checks.d.cts | 84 |
| $ZodCheckMaxSizeDef | checks.d.cts | 88 |
| $ZodCheckMaxSizeInternals | checks.d.cts | 92 |
| $ZodCheckMaxSize | checks.d.cts | 96 |
| $ZodCheckMinSizeDef | checks.d.cts | 100 |
| $ZodCheckMinSizeInternals | checks.d.cts | 104 |
| $ZodCheckMinSize | checks.d.cts | 108 |
| $ZodCheckSizeEqualsDef | checks.d.cts | 112 |
| $ZodCheckSizeEqualsInternals | checks.d.cts | 116 |
| $ZodCheckSizeEquals | checks.d.cts | 120 |
| $ZodCheckMaxLengthDef | checks.d.cts | 124 |
| $ZodCheckMaxLengthInternals | checks.d.cts | 128 |
| $ZodCheckMaxLength | checks.d.cts | 132 |
| $ZodCheckMinLengthDef | checks.d.cts | 136 |
| $ZodCheckMinLengthInternals | checks.d.cts | 140 |
| $ZodCheckMinLength | checks.d.cts | 144 |
| $ZodCheckLengthEqualsDef | checks.d.cts | 148 |
| $ZodCheckLengthEqualsInternals | checks.d.cts | 152 |
| $ZodCheckLengthEquals | checks.d.cts | 156 |
| $ZodStringFormats | checks.d.cts | 160 |
| $ZodCheckStringFormatDef | checks.d.cts | 161 |
| $ZodCheckStringFormatInternals | checks.d.cts | 166 |
| $ZodCheckStringFormat | checks.d.cts | 170 |
| $ZodCheckRegexDef | checks.d.cts | 174 |
| $ZodCheckRegexInternals | checks.d.cts | 178 |
| $ZodCheckRegex | checks.d.cts | 182 |
| $ZodCheckLowerCaseDef | checks.d.cts | 186 |
| $ZodCheckLowerCaseInternals | checks.d.cts | 188 |
| $ZodCheckLowerCase | checks.d.cts | 192 |
| $ZodCheckUpperCaseDef | checks.d.cts | 196 |
| $ZodCheckUpperCaseInternals | checks.d.cts | 198 |
| $ZodCheckUpperCase | checks.d.cts | 202 |
| $ZodCheckIncludesDef | checks.d.cts | 206 |
| $ZodCheckIncludesInternals | checks.d.cts | 210 |
| $ZodCheckIncludes | checks.d.cts | 214 |
| $ZodCheckStartsWithDef | checks.d.cts | 218 |
| $ZodCheckStartsWithInternals | checks.d.cts | 221 |
| $ZodCheckStartsWith | checks.d.cts | 225 |
| $ZodCheckEndsWithDef | checks.d.cts | 229 |
| $ZodCheckEndsWithInternals | checks.d.cts | 232 |
| $ZodCheckEndsWith | checks.d.cts | 236 |
| $ZodCheckPropertyDef | checks.d.cts | 240 |
| $ZodCheckPropertyInternals | checks.d.cts | 245 |
| $ZodCheckProperty | checks.d.cts | 249 |
| $ZodCheckMimeTypeDef | checks.d.cts | 253 |
| $ZodCheckMimeTypeInternals | checks.d.cts | 257 |
| $ZodCheckMimeType | checks.d.cts | 261 |
| $ZodCheckOverwriteDef | checks.d.cts | 265 |
| $ZodCheckOverwriteInternals | checks.d.cts | 269 |
| $ZodCheckOverwrite | checks.d.cts | 273 |
| $ZodChecks | checks.d.cts | 277 |
| $ZodStringFormatChecks | checks.d.cts | 278 |
| $ZodIssueBase | errors.d.cts | 6 |
| $ZodIssueInvalidType | errors.d.cts | 12 |
| $ZodIssueTooBig | errors.d.cts | 17 |
| $ZodIssueTooSmall | errors.d.cts | 25 |
| $ZodIssueInvalidStringFormat | errors.d.cts | 35 |
| $ZodIssueNotMultipleOf | errors.d.cts | 41 |
| $ZodIssueUnrecognizedKeys | errors.d.cts | 46 |
| $ZodIssueInvalidUnion | errors.d.cts | 51 |
| $ZodIssueInvalidKey | errors.d.cts | 57 |
| $ZodIssueInvalidElement | errors.d.cts | 63 |
| $ZodIssueInvalidValue | errors.d.cts | 70 |
| $ZodIssueCustom | errors.d.cts | 75 |
| $ZodIssueStringCommonFormats | errors.d.cts | 80 |
| $ZodIssueStringInvalidRegex | errors.d.cts | 83 |
| $ZodIssueStringInvalidJWT | errors.d.cts | 87 |
| $ZodIssueStringStartsWith | errors.d.cts | 91 |
| $ZodIssueStringEndsWith | errors.d.cts | 95 |
| $ZodIssueStringIncludes | errors.d.cts | 99 |
| $ZodStringFormatIssues | errors.d.cts | 103 |
| $ZodIssue | errors.d.cts | 104 |
| $ZodIssueCode | errors.d.cts | 105 |
| $ZodInternalIssue | errors.d.cts | 106 |
| RawIssue | errors.d.cts | 107 |
| $ZodRawIssue | errors.d.cts | 115 |
| $ZodErrorMap | errors.d.cts | 116 |
| $ZodError | errors.d.cts | 121 |
| $ZodRealError | errors.d.cts | 132 |
| $ZodFlattenedError | errors.d.cts | 135 |
| _FlattenedError | errors.d.cts | 136 |
| _ZodFormattedError | errors.d.cts | 144 |
| $ZodFormattedError | errors.d.cts | 151 |
| $ZodErrorTree | errors.d.cts | 156 |
| ZodTrait | core.d.cts | 4 |
| $constructor | core.d.cts | 10 |
| $brand | core.d.cts | 20 |
| $ZodBranded | core.d.cts | 25 |
| $ZodAsyncError | core.d.cts | 26 |
| $ZodEncodeError | core.d.cts | 29 |
| output | core.d.cts | 37 |
| $ZodConfig | core.d.cts | 43 |
| $ZodErrorClass | parse.d.cts | 5 |
| $Parse | parse.d.cts | 8 |
| $ParseAsync | parse.d.cts | 14 |
| $SafeParse | parse.d.cts | 20 |
| $SafeParseAsync | parse.d.cts | 23 |
| $Encode | parse.d.cts | 26 |
| $Decode | parse.d.cts | 29 |
| $EncodeAsync | parse.d.cts | 32 |
| $DecodeAsync | parse.d.cts | 35 |
| $SafeEncode | parse.d.cts | 38 |
| $SafeDecode | parse.d.cts | 41 |
| $SafeEncodeAsync | parse.d.cts | 44 |
| $SafeDecodeAsync | parse.d.cts | 47 |
| $output | registries.d.cts | 4 |
| $replace | registries.d.cts | 7 |
| MetadataType | registries.d.cts | 12 |
| $ZodRegistry | registries.d.cts | 13 |
| GlobalMeta | registries.d.cts | 31 |
| ModeWriter | doc.d.cts | 1 |
| Doc | doc.d.cts | 4 |
| Params | api.d.cts | 6 |
| TypeParams | api.d.cts | 11 |
| CheckParams | api.d.cts | 14 |
| StringFormatParams | api.d.cts | 16 |
| CheckStringFormatParams | api.d.cts | 17 |
| CheckTypeParams | api.d.cts | 18 |
| $ZodStringParams | api.d.cts | 19 |
| $ZodStringFormatParams | api.d.cts | 22 |
| $ZodCheckStringFormatParams | api.d.cts | 23 |
| $ZodEmailParams | api.d.cts | 24 |
| $ZodCheckEmailParams | api.d.cts | 25 |
| $ZodGUIDParams | api.d.cts | 27 |
| $ZodCheckGUIDParams | api.d.cts | 28 |
| $ZodUUIDParams | api.d.cts | 30 |
| $ZodCheckUUIDParams | api.d.cts | 31 |
| $ZodUUIDv4Params | api.d.cts | 33 |
| $ZodCheckUUIDv4Params | api.d.cts | 34 |
| $ZodUUIDv6Params | api.d.cts | 36 |
| $ZodCheckUUIDv6Params | api.d.cts | 37 |
| $ZodUUIDv7Params | api.d.cts | 39 |
| $ZodCheckUUIDv7Params | api.d.cts | 40 |
| $ZodURLParams | api.d.cts | 42 |
| $ZodCheckURLParams | api.d.cts | 43 |
| $ZodEmojiParams | api.d.cts | 45 |
| $ZodCheckEmojiParams | api.d.cts | 46 |
| $ZodNanoIDParams | api.d.cts | 48 |
| $ZodCheckNanoIDParams | api.d.cts | 49 |
| $ZodCUIDParams | api.d.cts | 51 |
| $ZodCheckCUIDParams | api.d.cts | 52 |
| $ZodCUID2Params | api.d.cts | 54 |
| $ZodCheckCUID2Params | api.d.cts | 55 |
| $ZodULIDParams | api.d.cts | 57 |
| $ZodCheckULIDParams | api.d.cts | 58 |
| $ZodXIDParams | api.d.cts | 60 |
| $ZodCheckXIDParams | api.d.cts | 61 |
| $ZodKSUIDParams | api.d.cts | 63 |
| $ZodCheckKSUIDParams | api.d.cts | 64 |
| $ZodIPv4Params | api.d.cts | 66 |
| $ZodCheckIPv4Params | api.d.cts | 67 |
| $ZodIPv6Params | api.d.cts | 69 |
| $ZodCheckIPv6Params | api.d.cts | 70 |
| $ZodCIDRv4Params | api.d.cts | 72 |
| $ZodCheckCIDRv4Params | api.d.cts | 73 |
| $ZodCIDRv6Params | api.d.cts | 75 |
| $ZodCheckCIDRv6Params | api.d.cts | 76 |
| $ZodBase64Params | api.d.cts | 78 |
| $ZodCheckBase64Params | api.d.cts | 79 |
| $ZodBase64URLParams | api.d.cts | 81 |
| $ZodCheckBase64URLParams | api.d.cts | 82 |
| $ZodE164Params | api.d.cts | 84 |
| $ZodCheckE164Params | api.d.cts | 85 |
| $ZodJWTParams | api.d.cts | 87 |
| $ZodCheckJWTParams | api.d.cts | 88 |
| $ZodISODateTimeParams | api.d.cts | 97 |
| $ZodCheckISODateTimeParams | api.d.cts | 98 |
| $ZodISODateParams | api.d.cts | 100 |
| $ZodCheckISODateParams | api.d.cts | 101 |
| $ZodISOTimeParams | api.d.cts | 103 |
| $ZodCheckISOTimeParams | api.d.cts | 104 |
| $ZodISODurationParams | api.d.cts | 106 |
| $ZodCheckISODurationParams | api.d.cts | 107 |
| $ZodNumberParams | api.d.cts | 109 |
| $ZodNumberFormatParams | api.d.cts | 110 |
| $ZodCheckNumberFormatParams | api.d.cts | 111 |
| $ZodBooleanParams | api.d.cts | 119 |
| $ZodBigIntParams | api.d.cts | 122 |
| $ZodBigIntFormatParams | api.d.cts | 123 |
| $ZodCheckBigIntFormatParams | api.d.cts | 124 |
| $ZodSymbolParams | api.d.cts | 129 |
| $ZodUndefinedParams | api.d.cts | 131 |
| $ZodNullParams | api.d.cts | 133 |
| $ZodAnyParams | api.d.cts | 135 |
| $ZodUnknownParams | api.d.cts | 137 |
| $ZodNeverParams | api.d.cts | 139 |
| $ZodVoidParams | api.d.cts | 141 |
| $ZodDateParams | api.d.cts | 143 |
| $ZodNaNParams | api.d.cts | 146 |
| $ZodCheckLessThanParams | api.d.cts | 148 |
| $ZodCheckGreaterThanParams | api.d.cts | 154 |
| $ZodCheckMultipleOfParams | api.d.cts | 164 |
| $ZodCheckMaxSizeParams | api.d.cts | 166 |
| $ZodCheckMinSizeParams | api.d.cts | 168 |
| $ZodCheckSizeEqualsParams | api.d.cts | 170 |
| $ZodCheckMaxLengthParams | api.d.cts | 172 |
| $ZodCheckMinLengthParams | api.d.cts | 174 |
| $ZodCheckLengthEqualsParams | api.d.cts | 176 |
| $ZodCheckRegexParams | api.d.cts | 178 |
| $ZodCheckLowerCaseParams | api.d.cts | 180 |
| $ZodCheckUpperCaseParams | api.d.cts | 182 |
| $ZodCheckIncludesParams | api.d.cts | 184 |
| $ZodCheckStartsWithParams | api.d.cts | 186 |
| $ZodCheckEndsWithParams | api.d.cts | 188 |
| $ZodCheckPropertyParams | api.d.cts | 190 |
| $ZodCheckMimeTypeParams | api.d.cts | 194 |
| $ZodArrayParams | api.d.cts | 201 |
| $ZodObjectParams | api.d.cts | 203 |
| $ZodUnionParams | api.d.cts | 204 |
| $ZodTypeDiscriminableInternals | api.d.cts | 206 |
| $ZodTypeDiscriminable | api.d.cts | 209 |
| $ZodDiscriminatedUnionParams | api.d.cts | 212 |
| $ZodIntersectionParams | api.d.cts | 214 |
| $ZodTupleParams | api.d.cts | 216 |
| $ZodRecordParams | api.d.cts | 219 |
| $ZodMapParams | api.d.cts | 221 |
| $ZodSetParams | api.d.cts | 223 |
| $ZodEnumParams | api.d.cts | 225 |
| $ZodLiteralParams | api.d.cts | 236 |
| $ZodFileParams | api.d.cts | 239 |
| $ZodTransformParams | api.d.cts | 241 |
| $ZodOptionalParams | api.d.cts | 243 |
| $ZodNullableParams | api.d.cts | 245 |
| $ZodDefaultParams | api.d.cts | 247 |
| $ZodNonOptionalParams | api.d.cts | 249 |
| $ZodSuccessParams | api.d.cts | 251 |
| $ZodCatchParams | api.d.cts | 253 |
| $ZodPipeParams | api.d.cts | 255 |
| $ZodReadonlyParams | api.d.cts | 257 |
| $ZodTemplateLiteralParams | api.d.cts | 259 |
| $ZodLazyParams | api.d.cts | 261 |
| $ZodPromiseParams | api.d.cts | 263 |
| $ZodCustomParams | api.d.cts | 265 |
| $ZodSuperRefineIssue | api.d.cts | 268 |
| RawIssue | api.d.cts | 269 |
| $RefinementCtx | api.d.cts | 275 |
| $ZodStringBoolParams | api.d.cts | 280 |
| ProcessParams | to-json-schema.d.cts | 29 |
| EmitParams | to-json-schema.d.cts | 33 |
| Seen | to-json-schema.d.cts | 48 |
| ZodIssue | errors.d.cts | 4 |
| ZodError | errors.d.cts | 6 |
| IssueData | errors.d.cts | 30 |
| ZodSafeParseResult | parse.d.cts | 3 |
| ZodSafeParseSuccess | parse.d.cts | 4 |
| ZodSafeParseError | parse.d.cts | 9 |
| ZodType | schemas.d.cts | 4 |
| _ZodType | schemas.d.cts | 76 |
| _ZodString | schemas.d.cts | 79 |
| ZodString | schemas.d.cts | 100 |
| ZodStringFormat | schemas.d.cts | 159 |
| ZodEmail | schemas.d.cts | 162 |
| ZodGUID | schemas.d.cts | 167 |
| ZodUUID | schemas.d.cts | 172 |
| ZodURL | schemas.d.cts | 180 |
| ZodEmoji | schemas.d.cts | 186 |
| ZodNanoID | schemas.d.cts | 191 |
| ZodCUID | schemas.d.cts | 196 |
| ZodCUID2 | schemas.d.cts | 201 |
| ZodULID | schemas.d.cts | 206 |
| ZodXID | schemas.d.cts | 211 |
| ZodKSUID | schemas.d.cts | 216 |
| ZodIPv4 | schemas.d.cts | 221 |
| ZodIPv6 | schemas.d.cts | 226 |
| ZodCIDRv4 | schemas.d.cts | 231 |
| ZodCIDRv6 | schemas.d.cts | 236 |
| ZodBase64 | schemas.d.cts | 241 |
| ZodBase64URL | schemas.d.cts | 246 |
| ZodE164 | schemas.d.cts | 251 |
| ZodJWT | schemas.d.cts | 256 |
| ZodCustomStringFormat | schemas.d.cts | 261 |
| _ZodNumber | schemas.d.cts | 271 |
| ZodNumber | schemas.d.cts | 301 |
| ZodNumberFormat | schemas.d.cts | 305 |
| ZodInt | schemas.d.cts | 309 |
| ZodFloat32 | schemas.d.cts | 312 |
| ZodFloat64 | schemas.d.cts | 315 |
| ZodInt32 | schemas.d.cts | 318 |
| ZodUInt32 | schemas.d.cts | 321 |
| _ZodBoolean | schemas.d.cts | 324 |
| ZodBoolean | schemas.d.cts | 326 |
| _ZodBigInt | schemas.d.cts | 330 |
| ZodBigInt | schemas.d.cts | 348 |
| ZodBigIntFormat | schemas.d.cts | 352 |
| ZodSymbol | schemas.d.cts | 358 |
| ZodUndefined | schemas.d.cts | 362 |
| ZodNull | schemas.d.cts | 367 |
| ZodAny | schemas.d.cts | 372 |
| ZodUnknown | schemas.d.cts | 376 |
| ZodNever | schemas.d.cts | 380 |
| ZodVoid | schemas.d.cts | 384 |
| _ZodDate | schemas.d.cts | 389 |
| ZodDate | schemas.d.cts | 397 |
| ZodArray | schemas.d.cts | 401 |
| SafeExtendShape | schemas.d.cts | 412 |
| ZodObject | schemas.d.cts | 415 |
| ZodUnion | schemas.d.cts | 455 |
| ZodDiscriminatedUnion | schemas.d.cts | 460 |
| ZodIntersection | schemas.d.cts | 466 |
| ZodTuple | schemas.d.cts | 470 |
| ZodRecord | schemas.d.cts | 477 |
| ZodMap | schemas.d.cts | 484 |
| ZodSet | schemas.d.cts | 490 |
| ZodEnum | schemas.d.cts | 498 |
| ZodLiteral | schemas.d.cts | 518 |
| ZodFile | schemas.d.cts | 526 |
| ZodTransform | schemas.d.cts | 533 |
| ZodOptional | schemas.d.cts | 537 |
| ZodNullable | schemas.d.cts | 542 |
| ZodDefault | schemas.d.cts | 548 |
| ZodPrefault | schemas.d.cts | 555 |
| ZodNonOptional | schemas.d.cts | 560 |
| ZodSuccess | schemas.d.cts | 565 |
| ZodCatch | schemas.d.cts | 570 |
| ZodNaN | schemas.d.cts | 578 |
| ZodPipe | schemas.d.cts | 582 |
| ZodCodec | schemas.d.cts | 588 |
| ZodReadonly | schemas.d.cts | 597 |
| ZodTemplateLiteral | schemas.d.cts | 602 |
| ZodLazy | schemas.d.cts | 606 |
| ZodPromise | schemas.d.cts | 611 |
| ZodFunction | schemas.d.cts | 616 |
| ZodCustom | schemas.d.cts | 645 |
| ZodInstanceOfParams | schemas.d.cts | 652 |
| inferFlattenedErrors | compat.d.cts | 25 |
| inferFormattedError | compat.d.cts | 27 |
| BRAND | compat.d.cts | 29 |
| ZodRawShape | compat.d.cts | 47 |
| ZodFirstPartyTypeKind | compat.d.cts | 49 |
| ZodISODateTime | iso.d.cts | 3 |
| ZodISODate | iso.d.cts | 8 |
| ZodISOTime | iso.d.cts | 13 |
| ZodISODuration | iso.d.cts | 18 |
| ZodCoercedString | coerce.d.cts | 3 |
| ZodCoercedNumber | coerce.d.cts | 6 |
| ZodCoercedBoolean | coerce.d.cts | 9 |
| ZodCoercedBigInt | coerce.d.cts | 12 |
| ZodCoercedDate | coerce.d.cts | 15 |
| Event | global.d.ts | 10 |
| AnimationEvent | global.d.ts | 11 |
| ClipboardEvent | global.d.ts | 12 |
| CompositionEvent | global.d.ts | 13 |
| DragEvent | global.d.ts | 14 |
| FocusEvent | global.d.ts | 15 |
| KeyboardEvent | global.d.ts | 17 |
| MouseEvent | global.d.ts | 18 |
| TouchEvent | global.d.ts | 19 |
| PointerEvent | global.d.ts | 20 |
| ToggleEvent | global.d.ts | 21 |
| TransitionEvent | global.d.ts | 22 |
| UIEvent | global.d.ts | 23 |
| WheelEvent | global.d.ts | 24 |
| EventTarget | global.d.ts | 26 |
| Document | global.d.ts | 27 |
| DataTransfer | global.d.ts | 28 |
| StyleMedia | global.d.ts | 29 |
| Element | global.d.ts | 31 |
| DocumentFragment | global.d.ts | 32 |
| HTMLElement | global.d.ts | 34 |
| HTMLAnchorElement | global.d.ts | 35 |
| HTMLAreaElement | global.d.ts | 36 |
| HTMLAudioElement | global.d.ts | 37 |
| HTMLBaseElement | global.d.ts | 38 |
| HTMLBodyElement | global.d.ts | 39 |
| HTMLBRElement | global.d.ts | 40 |
| HTMLCanvasElement | global.d.ts | 42 |
| HTMLDataElement | global.d.ts | 43 |
| HTMLDataListElement | global.d.ts | 44 |
| HTMLDetailsElement | global.d.ts | 45 |
| HTMLDialogElement | global.d.ts | 46 |
| HTMLDivElement | global.d.ts | 47 |
| HTMLDListElement | global.d.ts | 48 |
| HTMLEmbedElement | global.d.ts | 49 |
| HTMLFieldSetElement | global.d.ts | 50 |
| HTMLFormElement | global.d.ts | 51 |
| HTMLHeadingElement | global.d.ts | 52 |
| HTMLHeadElement | global.d.ts | 53 |
| HTMLHRElement | global.d.ts | 54 |
| HTMLHtmlElement | global.d.ts | 55 |
| HTMLIFrameElement | global.d.ts | 56 |
| HTMLImageElement | global.d.ts | 57 |
| HTMLLabelElement | global.d.ts | 60 |
| HTMLLegendElement | global.d.ts | 61 |
| HTMLLIElement | global.d.ts | 62 |
| HTMLLinkElement | global.d.ts | 63 |
| HTMLMapElement | global.d.ts | 64 |
| HTMLMetaElement | global.d.ts | 65 |
| HTMLMeterElement | global.d.ts | 66 |
| HTMLObjectElement | global.d.ts | 67 |
| HTMLOListElement | global.d.ts | 68 |
| HTMLOptGroupElement | global.d.ts | 69 |
| HTMLOptionElement | global.d.ts | 70 |
| HTMLOutputElement | global.d.ts | 71 |
| HTMLParagraphElement | global.d.ts | 72 |
| HTMLParamElement | global.d.ts | 73 |
| HTMLPreElement | global.d.ts | 74 |
| HTMLProgressElement | global.d.ts | 75 |
| HTMLQuoteElement | global.d.ts | 76 |
| HTMLSlotElement | global.d.ts | 77 |
| HTMLScriptElement | global.d.ts | 78 |
| HTMLSelectElement | global.d.ts | 79 |
| HTMLSourceElement | global.d.ts | 80 |
| HTMLSpanElement | global.d.ts | 81 |
| HTMLStyleElement | global.d.ts | 82 |
| HTMLTableElement | global.d.ts | 83 |
| HTMLTableColElement | global.d.ts | 84 |
| HTMLTableDataCellElement | global.d.ts | 85 |
| HTMLTableHeaderCellElement | global.d.ts | 86 |
| HTMLTableRowElement | global.d.ts | 87 |
| HTMLTableSectionElement | global.d.ts | 88 |
| HTMLTemplateElement | global.d.ts | 89 |
| HTMLTextAreaElement | global.d.ts | 90 |
| HTMLTimeElement | global.d.ts | 91 |
| HTMLTitleElement | global.d.ts | 92 |
| HTMLTrackElement | global.d.ts | 93 |
| HTMLUListElement | global.d.ts | 94 |
| HTMLVideoElement | global.d.ts | 95 |
| HTMLWebViewElement | global.d.ts | 96 |
| SVGElement | global.d.ts | 98 |
| SVGSVGElement | global.d.ts | 99 |
| SVGCircleElement | global.d.ts | 100 |
| SVGClipPathElement | global.d.ts | 101 |
| SVGDefsElement | global.d.ts | 102 |
| SVGDescElement | global.d.ts | 103 |
| SVGEllipseElement | global.d.ts | 104 |
| SVGFEBlendElement | global.d.ts | 105 |
| SVGFEColorMatrixElement | global.d.ts | 106 |
| SVGFECompositeElement | global.d.ts | 108 |
| SVGFEConvolveMatrixElement | global.d.ts | 109 |
| SVGFEDiffuseLightingElement | global.d.ts | 110 |
| SVGFEDisplacementMapElement | global.d.ts | 111 |
| SVGFEDistantLightElement | global.d.ts | 112 |
| SVGFEDropShadowElement | global.d.ts | 113 |
| SVGFEFloodElement | global.d.ts | 114 |
| SVGFEFuncAElement | global.d.ts | 115 |
| SVGFEFuncBElement | global.d.ts | 116 |
| SVGFEFuncGElement | global.d.ts | 117 |
| SVGFEFuncRElement | global.d.ts | 118 |
| SVGFEGaussianBlurElement | global.d.ts | 119 |
| SVGFEImageElement | global.d.ts | 120 |
| SVGFEMergeElement | global.d.ts | 121 |
| SVGFEMergeNodeElement | global.d.ts | 122 |
| SVGFEMorphologyElement | global.d.ts | 123 |
| SVGFEOffsetElement | global.d.ts | 124 |
| SVGFEPointLightElement | global.d.ts | 125 |
| SVGFESpecularLightingElement | global.d.ts | 126 |
| SVGFESpotLightElement | global.d.ts | 127 |
| SVGFETileElement | global.d.ts | 128 |
| SVGFETurbulenceElement | global.d.ts | 129 |
| SVGFilterElement | global.d.ts | 130 |
| SVGForeignObjectElement | global.d.ts | 131 |
| SVGGElement | global.d.ts | 132 |
| SVGImageElement | global.d.ts | 133 |
| SVGLineElement | global.d.ts | 134 |
| SVGLinearGradientElement | global.d.ts | 135 |
| SVGMarkerElement | global.d.ts | 136 |
| SVGMaskElement | global.d.ts | 137 |
| SVGMetadataElement | global.d.ts | 138 |
| SVGPathElement | global.d.ts | 139 |
| SVGPatternElement | global.d.ts | 140 |
| SVGPolygonElement | global.d.ts | 141 |
| SVGPolylineElement | global.d.ts | 142 |
| SVGRadialGradientElement | global.d.ts | 143 |
| SVGRectElement | global.d.ts | 144 |
| SVGSetElement | global.d.ts | 145 |
| SVGStopElement | global.d.ts | 146 |
| SVGSwitchElement | global.d.ts | 147 |
| SVGSymbolElement | global.d.ts | 148 |
| SVGTextElement | global.d.ts | 149 |
| SVGTextPathElement | global.d.ts | 150 |
| SVGTSpanElement | global.d.ts | 151 |
| SVGUseElement | global.d.ts | 152 |
| SVGViewElement | global.d.ts | 153 |
| Text | global.d.ts | 156 |
| TouchList | global.d.ts | 157 |
| WebGLRenderingContext | global.d.ts | 158 |
| WebGL2RenderingContext | global.d.ts | 159 |
| TrustedHTML | global.d.ts | 161 |
| Blob | global.d.ts | 163 |
| MediaStream | global.d.ts | 164 |
| MediaSource | global.d.ts | 165 |
| PropertyValue | index.d.ts | 3 |
| Fallback | index.d.ts | 9 |
| StandardLonghandProperties | index.d.ts | 11 |
| StandardShorthandProperties | index.d.ts | 5285 |
| StandardProperties | index.d.ts | 6111 |
| VendorLonghandProperties | index.d.ts | 6115 |
| VendorShorthandProperties | index.d.ts | 7870 |
| VendorProperties | index.d.ts | 8023 |
| ObsoleteProperties | index.d.ts | 8025 |
| SvgProperties | index.d.ts | 9080 |
| Properties | index.d.ts | 9143 |
| StandardLonghandPropertiesHyphen | index.d.ts | 9149 |
| StandardShorthandPropertiesHyphen | index.d.ts | 14423 |
| StandardPropertiesHyphen | index.d.ts | 15249 |
| VendorLonghandPropertiesHyphen | index.d.ts | 15253 |
| VendorShorthandPropertiesHyphen | index.d.ts | 17008 |
| VendorPropertiesHyphen | index.d.ts | 17161 |
| ObsoletePropertiesHyphen | index.d.ts | 17165 |
| SvgPropertiesHyphen | index.d.ts | 18220 |
| PropertiesHyphen | index.d.ts | 18283 |
| StandardLonghandPropertiesFallback | index.d.ts | 18289 |
| StandardShorthandPropertiesFallback | index.d.ts | 18291 |
| StandardPropertiesFallback | index.d.ts | 18293 |
| VendorLonghandPropertiesFallback | index.d.ts | 18297 |
| VendorShorthandPropertiesFallback | index.d.ts | 18299 |
| VendorPropertiesFallback | index.d.ts | 18301 |
| ObsoletePropertiesFallback | index.d.ts | 18305 |
| SvgPropertiesFallback | index.d.ts | 18307 |
| PropertiesFallback | index.d.ts | 18309 |
| StandardLonghandPropertiesHyphenFallback | index.d.ts | 18315 |
| StandardShorthandPropertiesHyphenFallback | index.d.ts | 18317 |
| StandardPropertiesHyphenFallback | index.d.ts | 18319 |
| VendorLonghandPropertiesHyphenFallback | index.d.ts | 18323 |
| VendorShorthandPropertiesHyphenFallback | index.d.ts | 18325 |
| VendorPropertiesHyphenFallback | index.d.ts | 18327 |
| ObsoletePropertiesHyphenFallback | index.d.ts | 18331 |
| SvgPropertiesHyphenFallback | index.d.ts | 18333 |
| PropertiesHyphenFallback | index.d.ts | 18335 |
| AtRules | index.d.ts | 18341 |
| AdvancedPseudos | index.d.ts | 18361 |
| SimplePseudos | index.d.ts | 18387 |
| Pseudos | index.d.ts | 18499 |
| HtmlAttributes | index.d.ts | 18501 |
| SvgAttributes | index.d.ts | 18703 |
| Globals | index.d.ts | 18946 |
| NativeAnimationEvent | index.d.ts | 9 |
| NativeClipboardEvent | index.d.ts | 10 |
| NativeCompositionEvent | index.d.ts | 11 |
| NativeDragEvent | index.d.ts | 12 |
| NativeFocusEvent | index.d.ts | 13 |
| NativeKeyboardEvent | index.d.ts | 15 |
| NativeMouseEvent | index.d.ts | 16 |
| NativeTouchEvent | index.d.ts | 17 |
| NativePointerEvent | index.d.ts | 18 |
| NativeToggleEvent | index.d.ts | 19 |
| NativeTransitionEvent | index.d.ts | 20 |
| NativeUIEvent | index.d.ts | 21 |
| NativeWheelEvent | index.d.ts | 22 |
| Booleanish | index.d.ts | 28 |
| CrossOrigin | index.d.ts | 33 |
| AwaitedReactNode | index.d.ts | 42 |
| Destructor | index.d.ts | 62 |
| VoidOrUndefinedOnly | index.d.ts | 63 |
| InexactPartial | index.d.ts | 4251 |
| Defaultize | index.d.ts | 4257 |
| ReactManagedAttributes | index.d.ts | 4264 |
| SVGElementType | lucide-react.d.ts | 9 |
| IconNode | lucide-react.d.ts | 10 |
| SVGAttributes | lucide-react.d.ts | 11 |
| ElementAttributes | lucide-react.d.ts | 12 |
| LucideIcon | lucide-react.d.ts | 17 |
| Template | templates.ts | 1 |
| TemplateFolder | templates.ts | 23 |
| TemplateCategoryType | templates.ts | 34 |
| TemplateUsageLevel | templates.ts | 65 |
| PersonalizationTag | templates.ts | 68 |
| EmailComposition | templates.ts | 75 |
| TemplateUsage | templates.ts | 83 |
| TemplateFormValues | templates.ts | 93 |
| FolderFormValues | templates.ts | 102 |
| QuickReply | templates.ts | 107 |
| CampaignStatus | campaign.ts | 1 |
| EmailStepType | campaign.ts | 8 |
| EmailEventType | campaign.ts | 29 |
| CampaignMetrics | campaign.ts | 39 |
| Campaign | campaign.ts | 47 |
| CampaignStatusEnum | campaign.ts | 72 |
| ChartData | campaign.ts | 78 |
| MetricToggle | campaign.ts | 88 |
| CampaignEventCondition | campaign.ts | 95 |
| CampaignFormValues | campaign.ts | 191 |
| CampaignSteps | campaign.ts | 202 |
| PartialCampaignStep | campaign.ts | 204 |
| CampaignActionsEnum | campaign.ts | 243 |
| LeadsList | campaign.ts | 253 |
| CampaignDisplay | campaign.ts | 260 |
| WarmupSummaryData | campaign.ts | 275 |
| StatsCardData | campaign.ts | 282 |
| RecentReply | campaign.ts | 289 |
| SequenceStep | campaign.ts | 299 |
| EmailSequenceStep | campaign.ts | 301 |
| WaitSequenceStep | campaign.ts | 315 |
| DNSRecordType | domains.ts | 4 |
| DNSRecordStatus | domains.ts | 16 |
| DomainStatus | domains.ts | 19 |
| EmailAccountStatus | domains.ts | 27 |
| VerificationStatus | domains.ts | 35 |
| RelayType | domains.ts | 44 |
| DomainAccountCreationType | domains.ts | 51 |
| WarmupStatusType | domains.ts | 56 |
| DNSProvider | domains.ts | 59 |
| DNSRecord | domains.ts | 92 |
| Domain | domains.ts | 102 |
| DomainDB | domains.ts | 136 |
| DomainMock | domains.ts | 155 |
| DomainUpdate | domains.ts | 175 |
| DomainAnalytics | domains.ts | 180 |
| EmailAccount | domains.ts | 198 |
| DomainOrMock | domains.ts | 218 |
| DomainOrDB | domains.ts | 219 |
| AddDomainFormType | domains.ts | 263 |
| DomainSettingsFormType | domains.ts | 278 |
| SPFConfig | domains.ts | 281 |
| DKIMConfig | domains.ts | 287 |
| DMARCConfig | domains.ts | 293 |
| DomainAuthentication | domains.ts | 301 |
| WarmupConfig | domains.ts | 307 |
| ReputationFactors | domains.ts | 318 |
| DomainSettings | domains.ts | 332 |
| Mailbox | mailbox.ts | 1 |
| MailboxConfig | mailbox.ts | 39 |
| MailboxStatus | mailbox.ts | 54 |
| WarmupStatus | mailbox.ts | 69 |
| AccountCreationType | mailbox.ts | 83 |
| EmailProvider | mailbox.ts | 86 |
| AccountDetails | mailbox.ts | 96 |
| Client | clients-leads.ts | 18 |
| ClientStatus | clients-leads.ts | 20 |
| LeadStatus | clients-leads.ts | 29 |
| LeadListStatus | clients-leads.ts | 36 |
| Lead | clients-leads.ts | 55 |
| LeadList | clients-leads.ts | 64 |
| LeadListData | clients-leads.ts | 81 |
| CSVColumn | clients-leads.ts | 108 |
| CSVRecord | clients-leads.ts | 115 |
| DbLeadList | clients-leads.ts | 128 |
| DbLeadListRow | clients-leads.ts | 136 |
| LeadStat | clients-leads.ts | 144 |
| LeadStats | clients-leads.ts | 151 |
| EmailCampaign | conversation.ts | 6 |
| Email | conversation.ts | 11 |
| EmailWithDetails | conversation.ts | 27 |
| Message | conversation.ts | 33 |
| MessageType | conversation.ts | 45 |
| ConversationStatus | conversation.ts | 47 |
| TagType | conversation.ts | 54 |
| InboxFilter | conversation.ts | 63 |
| InboxFilterType | conversation.ts | 70 |
| Conversation | conversation.ts | 79 |
| Reply | conversation.ts | 102 |
| MessageThread | conversation.ts | 113 |
| InboxItem | conversation.ts | 125 |
| InboxState | conversation.ts | 131 |
| NavLink | nav-link.ts | 1 |
| BreadcrumbItem | nav-link.ts | 6 |
| RouteConfig | nav-link.ts | 12 |
| NavLinkItem | nav-link.ts | 24 |
| Notification | notification.ts | 2 |
| NotificationType | notification.ts | 23 |
| NotificationVariant | notification.ts | 48 |
| AlertNotification | notification.ts | 57 |
| AlertType | notification.ts | 66 |
| AlertSeverity | notification.ts | 74 |
| ToastNotification | notification.ts | 82 |
| ToastType | notification.ts | 90 |
| ToastPosition | notification.ts | 98 |
| NotificationAction | notification.ts | 108 |
| NotificationSettings | notification.ts | 116 |
| NotificationChannel | notification.ts | 128 |
| NotificationFrequency | notification.ts | 134 |
| NotificationPreferences | notification.ts | 141 |
| NotificationStatus | notification.ts | 153 |
| NotificationState | notification.ts | 155 |
| NotificationContext | notification.ts | 163 |
| NotificationQueue | notification.ts | 187 |
| NotificationTemplate | notification.ts | 194 |
| NotificationCategory | notification.ts | 205 |
| LegacyNotification | notification.ts | 215 |
| NotificationFilter | notification.ts | 225 |
| NotificationSort | notification.ts | 226 |
| AlertNotificationWithSeverity | notification.ts | 227 |
| ToastNotificationWithPosition | notification.ts | 230 |
| UserRole | auth.ts | 8 |
| Permission | auth.ts | 16 |
| Claims | auth.ts | 66 |
| User | auth.ts | 93 |
| Tenant | auth.ts | 96 |
| UserClaims | auth.ts | 103 |
| UserProfile | auth.ts | 113 |
| ConsolidatedUser | auth.ts | 124 |
| AuthContextType | auth.ts | 137 |
| NileDBUser | auth.ts | 156 |
| Session | auth.ts | 243 |
| TokenPayload | auth.ts | 253 |
| RefreshToken | auth.ts | 264 |
| PasswordReset | auth.ts | 312 |
| AuthStatus | auth.ts | 316 |
| AuthState | auth.ts | 330 |
| AuthError | auth.ts | 418 |
| AuthErrorCode | auth.ts | 439 |
| Tab | tab.ts | 3 |
| ClassPropKey | types.d.ts | 17 |
| ClassValue | types.d.ts | 18 |
| ClassProp | types.d.ts | 19 |
| OmitUndefined | types.d.ts | 29 |
| StringToBoolean | types.d.ts | 30 |
| CxOptions | index.d.ts | 19 |
| CxReturn | index.d.ts | 20 |
| ConfigVariants | index.d.ts | 23 |
| ConfigVariantsMulti | index.d.ts | 26 |
| Config | index.d.ts | 29 |
| Observer | createSubject.d.ts | 2 |
| Subscription | createSubject.d.ts | 5 |
| Subject | createSubject.d.ts | 8 |
| EventType | events.d.ts | 1 |
| PathString | common.d.ts | 6 |
| Traversable | common.d.ts | 11 |
| IsTuple | common.d.ts | 21 |
| ArrayKey | common.d.ts | 25 |
| Key | common.d.ts | 29 |
| AsKey | common.d.ts | 34 |
| ToKey | common.d.ts | 39 |
| PathTuple | common.d.ts | 44 |
| AsPathTuple | common.d.ts | 49 |
| UnionToIntersection | common.d.ts | 60 |
| AppendNonBlankKey | common.d.ts | 72 |
| SplitPathStringImpl | common.d.ts | 80 |
| SplitPathString | common.d.ts | 93 |
| JoinPathTupleImpl | common.d.ts | 100 |
| JoinPathTuple | common.d.ts | 111 |
| MapKeys | common.d.ts | 123 |
| TryAccess | common.d.ts | 140 |
| TryAccessArray | common.d.ts | 151 |
| EvaluateKey | common.d.ts | 163 |
| EvaluatePath | common.d.ts | 176 |
| TupleKeys | common.d.ts | 188 |
| NumericObjectKeys | common.d.ts | 197 |
| NumericKeys | common.d.ts | 210 |
| ObjectKeys | common.d.ts | 221 |
| CheckKeyConstraint | common.d.ts | 235 |
| ContainsIndexable | common.d.ts | 246 |
| KeysImpl | common.d.ts | 251 |
| Keys | common.d.ts | 268 |
| HasKey | common.d.ts | 282 |
| ValidPathPrefixImpl | common.d.ts | 290 |
| ValidPathPrefix | common.d.ts | 302 |
| HasPath | common.d.ts | 314 |
| AnyIsEqual | eager.d.ts | 9 |
| PathImpl | eager.d.ts | 17 |
| PathInternal | eager.d.ts | 24 |
| Path | eager.d.ts | 37 |
| FieldPath | eager.d.ts | 41 |
| ArrayPathImpl | eager.d.ts | 49 |
| ArrayPathInternal | eager.d.ts | 56 |
| ArrayPath | eager.d.ts | 70 |
| FieldArrayPath | eager.d.ts | 74 |
| PathValue | eager.d.ts | 85 |
| PathValueImpl | eager.d.ts | 86 |
| FieldPathValue | eager.d.ts | 90 |
| FieldArrayPathValue | eager.d.ts | 94 |
| FieldPathValues | eager.d.ts | 105 |
| FieldPathByValue | eager.d.ts | 118 |
| FieldArrayPathByValue | eager.d.ts | 131 |
| FieldArrayWithId | fieldArray.d.ts | 17 |
| FieldArray | fieldArray.d.ts | 18 |
| UseFieldArraySwap | fieldArray.d.ts | 41 |
| UseFieldArrayMove | fieldArray.d.ts | 56 |
| UseFieldArrayPrepend | fieldArray.d.ts | 78 |
| UseFieldArrayAppend | fieldArray.d.ts | 100 |
| UseFieldArrayRemove | fieldArray.d.ts | 120 |
| UseFieldArrayInsert | fieldArray.d.ts | 143 |
| UseFieldArrayUpdate | fieldArray.d.ts | 164 |
| UseFieldArrayReplace | fieldArray.d.ts | 183 |
| UseFieldArrayReturn | fieldArray.d.ts | 184 |
| ResolverSuccess | resolvers.d.ts | 4 |
| ResolverError | resolvers.d.ts | 8 |
| ResolverResult | resolvers.d.ts | 12 |
| ResolverOptions | resolvers.d.ts | 13 |
| Resolver | resolvers.d.ts | 19 |
| NestedValue | form.d.ts | 16 |
| DefaultValues | form.d.ts | 19 |
| InternalNameSet | form.d.ts | 20 |
| ValidationMode | form.d.ts | 21 |
| Mode | form.d.ts | 22 |
| ValidationModeFlags | form.d.ts | 23 |
| CriteriaMode | form.d.ts | 30 |
| SubmitHandler | form.d.ts | 31 |
| FormSubmitHandler | form.d.ts | 32 |
| SubmitErrorHandler | form.d.ts | 39 |
| SetValueConfig | form.d.ts | 40 |
| TriggerConfig | form.d.ts | 45 |
| ResetFieldConfig | form.d.ts | 48 |
| ChangeHandler | form.d.ts | 54 |
| DelayCallback | form.d.ts | 58 |
| AsyncDefaultValues | form.d.ts | 59 |
| FieldNamesMarkedBoolean | form.d.ts | 78 |
| KeepStateOptions | form.d.ts | 110 |
| SetFieldValue | form.d.ts | 124 |
| RefCallBack | form.d.ts | 125 |
| UseFormRegisterReturn | form.d.ts | 126 |
| UseFormRegister | form.d.ts | 172 |
| SetFocusOptions | form.d.ts | 173 |
| UseFormSetFocus | form.d.ts | 194 |
| UseFormGetValues | form.d.ts | 195 |
| UseFormSubscribe | form.d.ts | 306 |
| UseFormWatch | form.d.ts | 316 |
| UseFormTrigger | form.d.ts | 412 |
| UseFormClearErrors | form.d.ts | 429 |
| UseFormSetValue | form.d.ts | 459 |
| UseFormSetError | form.d.ts | 481 |
| UseFormUnregister | form.d.ts | 502 |
| UseFormHandleSubmit | form.d.ts | 526 |
| UseFormResetField | form.d.ts | 542 |
| ResetAction | form.d.ts | 543 |
| UseFormReset | form.d.ts | 578 |
| WatchInternal | form.d.ts | 579 |
| GetIsDirty | form.d.ts | 580 |
| Subjects | form.d.ts | 586 |
| Names | form.d.ts | 593 |
| BatchFieldArrayUpdate | form.d.ts | 602 |
| FromSubscribe | form.d.ts | 606 |
| Control | form.d.ts | 616 |
| WatchObserver | form.d.ts | 655 |
| UseFormReturn | form.d.ts | 660 |
| Noop | utils.d.ts | 2 |
| File | utils.d.ts | 3 |
| FileList | utils.d.ts | 7 |
| Primitive | utils.d.ts | 12 |
| BrowserNativeObject | utils.d.ts | 13 |
| EmptyObject | utils.d.ts | 14 |
| NonUndefined | utils.d.ts | 17 |
| LiteralUnion | utils.d.ts | 18 |
| ExtractObjects | utils.d.ts | 21 |
| DeepPartial | utils.d.ts | 22 |
| DeepPartialSkipArrayKey | utils.d.ts | 25 |
| IsAny | utils.d.ts | 39 |
| IsNever | utils.d.ts | 48 |
| IsEqual | utils.d.ts | 63 |
| DeepMap | utils.d.ts | 64 |
| IsFlatObject | utils.d.ts | 67 |
| Merge | utils.d.ts | 68 |
| InternalFieldName | fields.d.ts | 3 |
| FieldName | fields.d.ts | 4 |
| CustomElement | fields.d.ts | 5 |
| FieldValue | fields.d.ts | 15 |
| FieldValues | fields.d.ts | 16 |
| NativeFieldValue | fields.d.ts | 17 |
| FieldElement | fields.d.ts | 18 |
| Ref | fields.d.ts | 19 |
| Field | fields.d.ts | 20 |
| FieldRefs | fields.d.ts | 28 |
| Message | errors.d.ts | 4 |
| MultipleFieldErrors | errors.d.ts | 5 |
| FieldError | errors.d.ts | 10 |
| ErrorOption | errors.d.ts | 17 |
| DeepRequired | errors.d.ts | 22 |
| FieldErrorsImpl | errors.d.ts | 25 |
| GlobalError | errors.d.ts | 28 |
| FieldErrors | errors.d.ts | 32 |
| InternalFieldErrors | errors.d.ts | 35 |
| ValidationValue | validator.d.ts | 5 |
| ValidationRule | validator.d.ts | 6 |
| ValidationValueMessage | validator.d.ts | 7 |
| ValidateResult | validator.d.ts | 11 |
| Validate | validator.d.ts | 12 |
| RegisterOptions | validator.d.ts | 13 |
| MaxType | validator.d.ts | 41 |
| MinType | validator.d.ts | 42 |
| ControllerFieldState | controller.d.ts | 4 |
| UseControllerReturn | controller.d.ts | 27 |
| Path | index.d.ts | 6 |
| CanvasPath_D3Shape | index.d.ts | 18 |
| DefaultArcObject | index.d.ts | 46 |
| Arc | index.d.ts | 81 |
| PieArcDatum | index.d.ts | 361 |
| Pie | index.d.ts | 400 |
| Line | index.d.ts | 617 |
| LineRadial | index.d.ts | 779 |
| RadialLine | index.d.ts | 941 |
| Area | index.d.ts | 965 |
| AreaRadial | index.d.ts | 1235 |
| RadialArea | index.d.ts | 1507 |
| CurveGeneratorLineOnly | index.d.ts | 1533 |
| CurveFactoryLineOnly | index.d.ts | 1551 |
| CurveGenerator | index.d.ts | 1569 |
| CurveFactory | index.d.ts | 1584 |
| CurveBundleFactory | index.d.ts | 1637 |
| CurveCardinalFactory | index.d.ts | 1663 |
| CurveCatmullRomFactory | index.d.ts | 1703 |
| DefaultLinkObject | index.d.ts | 1813 |
| Link | index.d.ts | 1848 |
| LinkRadial | index.d.ts | 2044 |
| RadialLink | index.d.ts | 2137 |
| SymbolType | index.d.ts | 2186 |
| Symbol | index.d.ts | 2206 |
| SeriesPoint | index.d.ts | 2425 |
| Series | index.d.ts | 2446 |
| Stack | index.d.ts | 2475 |
| MouseHandlerDataParam | types.d.ts | 3 |
| SyncMethod | types.d.ts | 30 |
| TooltipTrigger | types.d.ts | 3 |
| CategoricalChartFunc | types.d.ts | 4 |
| ExternalMouseEvents | types.d.ts | 5 |
| TooltipType | DefaultTooltipContent.d.ts | 7 |
| ValueType | DefaultTooltipContent.d.ts | 8 |
| NameType | DefaultTooltipContent.d.ts | 9 |
| Formatter | DefaultTooltipContent.d.ts | 10 |
| Payload | DefaultTooltipContent.d.ts | 11 |
| Orientation | CartesianAxis.d.ts | 10 |
| Unit | CartesianAxis.d.ts | 12 |
| TickFormatter | CartesianAxis.d.ts | 14 |
| IState | CartesianAxis.d.ts | 50 |
| CartesianAxis | CartesianAxis.d.ts | 55 |
| Action | redux.d.ts | 17 |
| UnknownAction | redux.d.ts | 26 |
| AnyAction | redux.d.ts | 36 |
| ActionCreator | redux.d.ts | 56 |
| ActionCreatorsMapObject | redux.d.ts | 62 |
| Reducer | redux.d.ts | 91 |
| ReducersMapObject | redux.d.ts | 99 |
| StateFromReducersMapObject | redux.d.ts | 107 |
| ReducerFromReducersMapObject | redux.d.ts | 115 |
| ActionFromReducer | redux.d.ts | 121 |
| ActionFromReducersMapObject | redux.d.ts | 127 |
| PreloadedStateShapeFromReducersMapObject | redux.d.ts | 133 |
| Dispatch | redux.d.ts | 158 |
| Unsubscribe | redux.d.ts | 164 |
| ListenerCallback | redux.d.ts | 167 |
| Observable | redux.d.ts | 178 |
| Observer | redux.d.ts | 196 |
| Store | redux.d.ts | 208 |
| UnknownIfNonSpecific | redux.d.ts | 285 |
| StoreCreator | redux.d.ts | 298 |
| StoreEnhancer | redux.d.ts | 323 |
| StoreEnhancerStoreCreator | redux.d.ts | 324 |
| MiddlewareAPI | redux.d.ts | 487 |
| Middleware | redux.d.ts | 505 |
| Func | redux.d.ts | 549 |
| AnyFunc | immer.d.ts | 15 |
| PrimitiveType | immer.d.ts | 16 |
| AtomicObject | immer.d.ts | 18 |
| IfAvailable | immer.d.ts | 26 |
| WeakReferences | immer.d.ts | 31 |
| WritableDraft | immer.d.ts | 32 |
| Draft | immer.d.ts | 36 |
| Immutable | immer.d.ts | 38 |
| Patch | immer.d.ts | 41 |
| PatchListener | immer.d.ts | 46 |
| PatchesTuple | immer.d.ts | 50 |
| ValidRecipeReturnType | immer.d.ts | 51 |
| ReturnTypeWithPatchesIfNeeded | immer.d.ts | 52 |
| InferRecipeFromCurried | immer.d.ts | 56 |
| InferInitialStateFromCurried | immer.d.ts | 57 |
| InferCurriedFromRecipe | immer.d.ts | 58 |
| InferCurriedFromInitialStateAndRecipe | immer.d.ts | 59 |
| IProduce | immer.d.ts | 79 |
| IProduceWithPatches | immer.d.ts | 101 |
| Producer | immer.d.ts | 109 |
| Objectish | immer.d.ts | 111 |
| AnyObject | immer.d.ts | 112 |
| AnyArray | immer.d.ts | 115 |
| AnySet | immer.d.ts | 116 |
| AnyMap | immer.d.ts | 117 |
| ProducersFns | immer.d.ts | 134 |
| StrictMode | immer.d.ts | 138 |
| Immer | immer.d.ts | 139 |
| LongestTuple | reselect.d.ts | 8 |
| LongerOfTwo | reselect.d.ts | 20 |
| ElementAt | reselect.d.ts | 29 |
| ElementsAtGivenIndex | reselect.d.ts | 38 |
| Intersect | reselect.d.ts | 48 |
| MergeTuples | reselect.d.ts | 57 |
| ExtractParameters | reselect.d.ts | 67 |
| MergeParameters | reselect.d.ts | 77 |
| WeakMapMemoizeOptions | reselect.d.ts | 88 |
| Selector | reselect.d.ts | 189 |
| SelectorArray | reselect.d.ts | 203 |
| SelectorResultArray | reselect.d.ts | 209 |
| CreateSelectorOptions | reselect.d.ts | 220 |
| OutputSelectorFields | reselect.d.ts | 315 |
| OutputSelector | reselect.d.ts | 368 |
| Combiner | reselect.d.ts | 377 |
| EqualityFn | reselect.d.ts | 390 |
| DevModeCheckFrequency | reselect.d.ts | 397 |
| DevModeChecks | reselect.d.ts | 404 |
| DevModeChecksExecutionInfo | reselect.d.ts | 442 |
| GetStateFromSelectors | reselect.d.ts | 459 |
| GetParamsFromSelectors | reselect.d.ts | 465 |
| UnknownMemoizer | reselect.d.ts | 473 |
| MemoizeOptionsFromParameters | reselect.d.ts | 483 |
| OverrideMemoizeOptions | reselect.d.ts | 494 |
| ExtractMemoizerFields | reselect.d.ts | 503 |
| DefaultMemoizeFields | reselect.d.ts | 513 |
| AnyFunction | reselect.d.ts | 529 |
| UnknownFunction | reselect.d.ts | 535 |
| FallbackIfNever | reselect.d.ts | 544 |
| NonFunctionType | reselect.d.ts | 552 |
| FunctionType | reselect.d.ts | 560 |
| ExtractReturnType | reselect.d.ts | 566 |
| DropFirstParameter | reselect.d.ts | 575 |
| Distribute | reselect.d.ts | 586 |
| ArrayTail | reselect.d.ts | 592 |
| AnyNonNullishValue | reselect.d.ts | 603 |
| InterruptRecursion | reselect.d.ts | 612 |
| IfNever | reselect.d.ts | 620 |
| OmitIndexSignature | reselect.d.ts | 632 |
| UnionToIntersection | reselect.d.ts | 642 |
| Push | reselect.d.ts | 650 |
| LastOf | reselect.d.ts | 656 |
| TuplifyUnion | reselect.d.ts | 663 |
| ObjectValuesToTuple | reselect.d.ts | 670 |
| SetRequired | reselect.d.ts | 679 |
| IfUnknown | reselect.d.ts | 686 |
| FallbackIfUnknown | reselect.d.ts | 695 |
| Simplify | reselect.d.ts | 703 |
| CreateSelectorFunction | reselect.d.ts | 785 |
| SelectorResultsMap | reselect.d.ts | 955 |
| RootStateSelectors | reselect.d.ts | 971 |
| TypedStructuredSelectorCreator | reselect.d.ts | 981 |
| SelectorsObject | reselect.d.ts | 1095 |
| StructuredSelectorCreator | reselect.d.ts | 1107 |
| LruMemoizeOptions | reselect.d.ts | 1372 |
| ThunkDispatch | redux-thunk.d.ts | 14 |
| ThunkAction | redux-thunk.d.ts | 35 |
| ThunkActionDispatch | redux-thunk.d.ts | 44 |
| ThunkMiddleware | redux-thunk.d.ts | 51 |
| IfMaybeUndefined | uncheckedindexed.ts | 3 |
| IfUncheckedIndexedAccess | uncheckedindexed.ts | 7 |
| UncheckedIndexedAccess | uncheckedindexed.ts | 13 |
| DevToolsEnhancerOptions | index.d.ts | 25 |
| ActionCreatorInvariantMiddlewareOptions | index.d.ts | 222 |
| NonSerializableValue | index.d.ts | 243 |
| IgnorePaths | index.d.ts | 247 |
| SerializableStateInvariantMiddlewareOptions | index.d.ts | 257 |
| IsImmutableFunc | index.d.ts | 323 |
| ImmutableStateInvariantMiddlewareOptions | index.d.ts | 329 |
| Tuple | index.d.ts | 357 |
| IsAny | index.d.ts | 375 |
| CastAny | index.d.ts | 376 |
| IsUnknown | index.d.ts | 383 |
| FallbackIfUnknown | index.d.ts | 384 |
| IfMaybeUndefined | index.d.ts | 388 |
| IfVoid | index.d.ts | 392 |
| IsEmptyObj | index.d.ts | 396 |
| AtLeastTS35 | index.d.ts | 405 |
| IsUnknownOrNonInferrable | index.d.ts | 409 |
| UnionToIntersection | index.d.ts | 413 |
| ExcludeFromTuple | index.d.ts | 414 |
| ExtractDispatchFromMiddlewareTuple | index.d.ts | 418 |
| ExtractDispatchExtensions | index.d.ts | 419 |
| ExtractStoreExtensionsFromEnhancerTuple | index.d.ts | 420 |
| ExtractStoreExtensions | index.d.ts | 421 |
| ExtractStateExtensionsFromEnhancerTuple | index.d.ts | 422 |
| ExtractStateExtensions | index.d.ts | 423 |
| NoInfer | index.d.ts | 431 |
| NonUndefined | index.d.ts | 432 |
| WithRequiredProp | index.d.ts | 433 |
| WithOptionalProp | index.d.ts | 434 |
| TypeGuard | index.d.ts | 435 |
| HasMatchFunction | index.d.ts | 438 |
| Matcher | index.d.ts | 442 |
| ActionFromMatcher | index.d.ts | 444 |
| Id | index.d.ts | 445 |
| Tail | index.d.ts | 448 |
| UnknownIfNonSpecific | index.d.ts | 449 |
| SafePromise | index.d.ts | 454 |
| ThunkOptions | index.d.ts | 458 |
| GetDefaultMiddlewareOptions | index.d.ts | 461 |
| ThunkMiddlewareFor | index.d.ts | 467 |
| GetDefaultMiddleware | index.d.ts | 474 |
| AutoBatchOptions | index.d.ts | 486 |
| GetDefaultEnhancersOptions | index.d.ts | 521 |
| GetDefaultEnhancers | index.d.ts | 524 |
| ConfigureStoreOptions | index.d.ts | 533 |
| Middlewares | index.d.ts | 576 |
| Enhancers | index.d.ts | 577 |
| EnhancedStore | index.d.ts | 584 |
| PayloadAction | index.d.ts | 611 |
| PrepareAction | index.d.ts | 626 |
| _ActionCreatorWithPreparedPayload | index.d.ts | 644 |
| BaseActionCreator | index.d.ts | 654 |
| ActionCreatorWithPreparedPayload | index.d.ts | 671 |
| ActionCreatorWithOptionalPayload | index.d.ts | 686 |
| ActionCreatorWithoutPayload | index.d.ts | 701 |
| ActionCreatorWithPayload | index.d.ts | 715 |
| ActionCreatorWithNonInferrablePayload | index.d.ts | 729 |
| PayloadActionCreator | index.d.ts | 746 |
| IfPrepareActionMethodProvided | index.d.ts | 786 |
| TypedActionCreator | index.d.ts | 788 |
| ActionReducerMapBuilder | index.d.ts | 797 |
| Actions | index.d.ts | 901 |
| CaseReducer | index.d.ts | 918 |
| CaseReducers | index.d.ts | 928 |
| NotFunction | index.d.ts | 931 |
| ReducerWithInitialState | index.d.ts | 932 |
| SliceLike | index.d.ts | 1001 |
| AnySliceLike | index.d.ts | 1005 |
| SliceLikeReducerPath | index.d.ts | 1006 |
| SliceLikeState | index.d.ts | 1007 |
| WithSlice | index.d.ts | 1008 |
| ReducerMap | index.d.ts | 1011 |
| ExistingSliceLike | index.d.ts | 1012 |
| InjectConfig | index.d.ts | 1015 |
| CombinedSliceReducer | index.d.ts | 1024 |
| InitialState | index.d.ts | 1224 |
| BaseThunkAPI | index.d.ts | 1227 |
| SerializedError | index.d.ts | 1240 |
| RejectWithValue | index.d.ts | 1246 |
| FulfillWithMeta | index.d.ts | 1252 |
| AsyncThunkConfig | index.d.ts | 1265 |
| GetState | index.d.ts | 1275 |
| GetExtra | index.d.ts | 1278 |
| GetDispatch | index.d.ts | 1281 |
| GetThunkAPI | index.d.ts | 1284 |
| GetRejectValue | index.d.ts | 1285 |
| GetPendingMeta | index.d.ts | 1288 |
| GetFulfilledMeta | index.d.ts | 1291 |
| GetRejectedMeta | index.d.ts | 1294 |
| GetSerializedErrorType | index.d.ts | 1297 |
| MaybePromise | index.d.ts | 1300 |
| AsyncThunkPayloadCreatorReturnValue | index.d.ts | 1307 |
| AsyncThunkPayloadCreator | index.d.ts | 1314 |
| AsyncThunkAction | index.d.ts | 1324 |
| AsyncThunkDispatchConfig | index.d.ts | 1333 |
| AsyncThunkActionCreator | index.d.ts | 1339 |
| AsyncThunkOptions | index.d.ts | 1345 |
| AsyncThunkPendingActionCreator | index.d.ts | 1388 |
| AsyncThunkRejectedActionCreator | index.d.ts | 1397 |
| AsyncThunkFulfilledActionCreator | index.d.ts | 1416 |
| AsyncThunk | index.d.ts | 1432 |
| OverrideThunkApiConfigs | index.d.ts | 1439 |
| CreateAsyncThunkFunction | index.d.ts | 1440 |
| CreateAsyncThunk | index.d.ts | 1460 |
| UnwrappableAction | index.d.ts | 1464 |
| UnwrappedActionPayload | index.d.ts | 1469 |
| WithStrictNullChecks | index.d.ts | 1476 |
| InjectIntoConfig | index.d.ts | 1482 |
| Slice | index.d.ts | 1490 |
| InjectedSlice | index.d.ts | 1557 |
| CreateSliceOptions | index.d.ts | 1588 |
| ReducerType | index.d.ts | 1655 |
| ReducerDefinition | index.d.ts | 1660 |
| CaseReducerDefinition | index.d.ts | 1663 |
| CaseReducerWithPrepare | index.d.ts | 1669 |
| AsyncThunkSliceReducerConfig | index.d.ts | 1673 |
| AsyncThunkSliceReducerDefinition | index.d.ts | 1680 |
| PreventCircular | index.d.ts | 1686 |
| AsyncThunkCreator | index.d.ts | 1689 |
| ReducerCreators | index.d.ts | 1694 |
| SliceCaseReducers | index.d.ts | 1709 |
| SliceSelectors | index.d.ts | 1713 |
| SliceActionType | index.d.ts | 1716 |
| CaseReducerActions | index.d.ts | 1722 |
| ActionCreatorForCaseReducerWithPrepare | index.d.ts | 1734 |
| ActionCreatorForCaseReducer | index.d.ts | 1742 |
| SliceDefinedCaseReducers | index.d.ts | 1751 |
| RemappedSelector | index.d.ts | 1756 |
| SliceDefinedSelectors | index.d.ts | 1764 |
| ValidateSliceCaseReducers | index.d.ts | 1779 |
| BuildCreateSliceConfig | index.d.ts | 1786 |
| AnyFunction | index.d.ts | 1802 |
| AnyCreateSelectorFunction | index.d.ts | 1803 |
| GetSelectorsOptions | index.d.ts | 1804 |
| Comparer | index.d.ts | 1815 |
| IdSelector | index.d.ts | 1819 |
| Update | index.d.ts | 1823 |
| PreventAny | index.d.ts | 1841 |
| ActionMatchingAnyOf | index.d.ts | 1902 |
| ActionMatchingAllOf | index.d.ts | 1904 |
| UnknownAsyncThunkPendingAction | index.d.ts | 1925 |
| PendingActionFromAsyncThunk | index.d.ts | 1926 |
| UnknownAsyncThunkRejectedAction | index.d.ts | 1950 |
| RejectedActionFromAsyncThunk | index.d.ts | 1951 |
| RejectedWithValueActionFromAsyncThunk | index.d.ts | 1975 |
| UnknownAsyncThunkFulfilledAction | index.d.ts | 2003 |
| FulfilledActionFromAsyncThunk | index.d.ts | 2004 |
| UnknownAsyncThunkAction | index.d.ts | 2028 |
| AnyAsyncThunk | index.d.ts | 2029 |
| ActionsFromAsyncThunk | index.d.ts | 2040 |
| TaskAbortError | index.d.ts | 2069 |
| TypedActionCreatorWithMatchFunction | index.d.ts | 2080 |
| AnyListenerPredicate | index.d.ts | 2084 |
| ListenerPredicate | index.d.ts | 2086 |
| ConditionFunction | index.d.ts | 2088 |
| MatchFunction | index.d.ts | 2094 |
| ForkedTaskAPI | index.d.ts | 2096 |
| AsyncTaskExecutor | index.d.ts | 2116 |
| SyncTaskExecutor | index.d.ts | 2120 |
| ForkedTaskExecutor | index.d.ts | 2124 |
| TaskResolved | index.d.ts | 2126 |
| TaskRejected | index.d.ts | 2131 |
| TaskCancelled | index.d.ts | 2136 |
| TaskResult | index.d.ts | 2141 |
| ForkedTask | index.d.ts | 2143 |
| ForkOptions | index.d.ts | 2165 |
| ListenerEffectAPI | index.d.ts | 2173 |
| ListenerEffect | index.d.ts | 2295 |
| ListenerErrorInfo | index.d.ts | 2300 |
| ListenerErrorHandler | index.d.ts | 2312 |
| CreateListenerMiddlewareOptions | index.d.ts | 2316 |
| ListenerMiddleware | index.d.ts | 2324 |
| ListenerMiddlewareInstance | index.d.ts | 2328 |
| TakePatternOutputWithoutTimeout | index.d.ts | 2341 |
| TakePatternOutputWithTimeout | index.d.ts | 2343 |
| TakePattern | index.d.ts | 2345 |
| UnsubscribeListenerOptions | index.d.ts | 2351 |
| UnsubscribeListener | index.d.ts | 2355 |
| AddListenerOverloads | index.d.ts | 2360 |
| RemoveListenerOverloads | index.d.ts | 2403 |
| TypedAddListener | index.d.ts | 2409 |
| TypedRemoveListener | index.d.ts | 2439 |
| TypedStartListening | index.d.ts | 2474 |
| TypedStopListening | index.d.ts | 2512 |
| ListenerEntry | index.d.ts | 2549 |
| GuardedType | index.d.ts | 2561 |
| ListenerPredicateGuardedActionType | index.d.ts | 2563 |
| MiddlewareApiConfig | index.d.ts | 2582 |
| GetDispatchType | index.d.ts | 2586 |
| AddMiddleware | index.d.ts | 2589 |
| WithMiddleware | index.d.ts | 2593 |
| DynamicDispatch | index.d.ts | 2601 |
| DynamicMiddleware | index.d.ts | 2604 |
| DynamicMiddlewareInstance | index.d.ts | 2605 |
| RectRadius | Rectangle.d.ts | 7 |
| ContentType | Label.d.ts | 4 |
| LabelPosition | Label.d.ts | 5 |
| ImplicitLabelType | Label.d.ts | 25 |
| MinPointSize | BarUtils.d.ts | 14 |
| CurveType | Curve.d.ts | 8 |
| Point | Curve.d.ts | 13 |
| NullablePoint | Curve.d.ts | 21 |
| AllStackGroups | stackTypes.d.ts | 10 |
| StackGroup | stackTypes.d.ts | 15 |
| StackSeries | stackTypes.d.ts | 25 |
| StackDataPoint | stackTypes.d.ts | 32 |
| StackSeriesIdentifier | stackTypes.d.ts | 37 |
| BaseValue | Area.d.ts | 8 |
| Rectangle | Bar.d.ts | 11 |
| BarRectangleItem | Bar.d.ts | 17 |
| BarMouseEvent | Bar.d.ts | 56 |
| BarEvents | Bar.d.ts | 57 |
| LinePointItem | Line.d.ts | 7 |
| Data | LabelList.d.ts | 5 |
| ImplicitLabelListType | LabelList.d.ts | 24 |
| SizeType | Symbols.d.ts | 8 |
| InnerSymbolsProp | Symbols.d.ts | 9 |
| ScatterPointNode | Scatter.d.ts | 12 |
| ScatterPointItem | Scatter.d.ts | 17 |
| ScatterCustomizedShape | Scatter.d.ts | 26 |
| ErrorBarDataItem | ErrorBar.d.ts | 10 |
| ErrorBarDirection | ErrorBar.d.ts | 25 |
| ErrorBar | ErrorBar.d.ts | 45 |
| IfOverflow | IfOverflow.d.ts | 1 |
| Sign | getTicks.d.ts | 3 |
| GridLineType | CartesianGrid.d.ts | 18 |
| HorizontalCoordinatesGenerator | CartesianGrid.d.ts | 19 |
| VerticalCoordinatesGenerator | CartesianGrid.d.ts | 25 |
| BarPositionPosition | ChartUtils.d.ts | 18 |
| RechartsScale | ChartUtils.d.ts | 47 |
| OffsetAccessor | ChartUtils.d.ts | 121 |
| StackId | ChartUtils.d.ts | 123 |
| NormalizedStackId | ChartUtils.d.ts | 129 |
| StackOffsetType | types.d.ts | 19 |
| CartesianLayout | types.d.ts | 20 |
| PolarLayout | types.d.ts | 21 |
| LayoutType | types.d.ts | 27 |
| AxisType | types.d.ts | 28 |
| AxisDomainType | types.d.ts | 29 |
| DataKey | types.d.ts | 30 |
| PresentationAttributesAdaptChildEvent | types.d.ts | 32 |
| SymbolType | types.d.ts | 33 |
| LegendType | types.d.ts | 34 |
| TooltipType | types.d.ts | 35 |
| AllowInDimension | types.d.ts | 36 |
| Coordinate | types.d.ts | 40 |
| NullableCoordinate | types.d.ts | 44 |
| ChartCoordinate | types.d.ts | 51 |
| PolarCoordinate | types.d.ts | 66 |
| ScaleType | types.d.ts | 73 |
| EventHandler | types.d.ts | 74 |
| ReactEventHandler | types.d.ts | 77 |
| ClipboardEventHandler | types.d.ts | 78 |
| CompositionEventHandler | types.d.ts | 79 |
| DragEventHandler | types.d.ts | 80 |
| FocusEventHandler | types.d.ts | 81 |
| FormEventHandler | types.d.ts | 82 |
| KeyboardEventHandler | types.d.ts | 83 |
| MouseEventHandler | types.d.ts | 84 |
| TouchEventHandler | types.d.ts | 85 |
| PointerEventHandler | types.d.ts | 86 |
| UIEventHandler | types.d.ts | 87 |
| WheelEventHandler | types.d.ts | 88 |
| AnimationEventHandler | types.d.ts | 89 |
| TransitionEventHandler | types.d.ts | 90 |
| AdaptChildEventHandler | types.d.ts | 257 |
| AdaptChildReactEventHandler | types.d.ts | 260 |
| AdaptChildClipboardEventHandler | types.d.ts | 261 |
| AdaptChildCompositionEventHandler | types.d.ts | 262 |
| AdaptChildDragEventHandler | types.d.ts | 263 |
| AdaptChildFocusEventHandler | types.d.ts | 264 |
| AdaptChildFormEventHandler | types.d.ts | 265 |
| AdaptChildKeyboardEventHandler | types.d.ts | 266 |
| AdaptChildMouseEventHandler | types.d.ts | 267 |
| AdaptChildTouchEventHandler | types.d.ts | 268 |
| AdaptChildPointerEventHandler | types.d.ts | 269 |
| AdaptChildUIEventHandler | types.d.ts | 270 |
| AdaptChildWheelEventHandler | types.d.ts | 271 |
| AdaptChildAnimationEventHandler | types.d.ts | 272 |
| AdaptChildTransitionEventHandler | types.d.ts | 273 |
| DOMAttributesAdaptChildEvent | types.d.ts | 274 |
| FilteredSvgElementType | types.d.ts | 441 |
| AnimationTiming | types.d.ts | 445 |
| AnimationDuration | types.d.ts | 447 |
| OffsetVertical | types.d.ts | 448 |
| OffsetHorizontal | types.d.ts | 452 |
| ChartOffsetInternal | types.d.ts | 461 |
| Padding | types.d.ts | 470 |
| GeometrySector | types.d.ts | 476 |
| GeometrySectorWithCornerRadius | types.d.ts | 484 |
| AxisDomainItem | types.d.ts | 489 |
| AxisDomain | types.d.ts | 506 |
| NumberDomain | types.d.ts | 516 |
| CategoricalDomain | types.d.ts | 517 |
| TickProp | types.d.ts | 518 |
| AxisInterval | types.d.ts | 579 |
| AxisTick | types.d.ts | 585 |
| TickItem | types.d.ts | 586 |
| CartesianTickItem | types.d.ts | 592 |
| Margin | types.d.ts | 597 |
| CartesianViewBox | types.d.ts | 603 |
| CartesianViewBoxRequired | types.d.ts | 609 |
| PolarViewBox | types.d.ts | 610 |
| PolarViewBoxRequired | types.d.ts | 619 |
| ViewBox | types.d.ts | 620 |
| RecordString | types.d.ts | 621 |
| AdaptEventHandlersReturn | types.d.ts | 622 |
| TooltipEventType | types.d.ts | 639 |
| SankeyNode | types.d.ts | 640 |
| SankeyLink | types.d.ts | 653 |
| Size | types.d.ts | 661 |
| ActiveDotType | types.d.ts | 686 |
| ActiveShape | types.d.ts | 703 |
| RangeObj | types.d.ts | 704 |
| MousePointer | types.d.ts | 718 |
| ChartPointer | types.d.ts | 727 |
| ContentType | DefaultLegendContent.d.ts | 7 |
| IconType | DefaultLegendContent.d.ts | 8 |
| HorizontalAlignmentType | DefaultLegendContent.d.ts | 9 |
| VerticalAlignmentType | DefaultLegendContent.d.ts | 10 |
| Formatter | DefaultLegendContent.d.ts | 11 |
| LegendPayload | DefaultLegendContent.d.ts | 12 |
| DefaultLegendContent | DefaultLegendContent.d.ts | 48 |
| UniqueFunc | getUniqPayload.d.ts | 1 |
| UniqueOption | getUniqPayload.d.ts | 9 |
| ElementOffset | useElementOffset.d.ts | 5 |
| SetElementOffset | useElementOffset.d.ts | 35 |
| LegendItemSorter | Legend.d.ts | 7 |
| State | Legend.d.ts | 23 |
| Legend | Legend.d.ts | 27 |
| CursorDefinition | Cursor.d.ts | 10 |
| ContentType | Tooltip.d.ts | 10 |
| PropertiesReadFromContext | Tooltip.d.ts | 18 |
| TextAnchor | Text.d.ts | 3 |
| Words | Text.d.ts | 16 |
| Comp | Customized.d.ts | 6 |
| TickOrientation | PolarRadiusAxis.d.ts | 4 |
| PolarRadiusAxis | PolarRadiusAxis.d.ts | 17 |
| PolarAngleAxis | PolarAngleAxis.d.ts | 40 |
| PieDef | Pie.d.ts | 7 |
| PieLabelLine | Pie.d.ts | 23 |
| PieLabel | Pie.d.ts | 27 |
| PieSectorData | Pie.d.ts | 30 |
| PieSectorDataItem | Pie.d.ts | 42 |
| PieSvgAttributes | Pie.d.ts | 86 |
| RealPieData | Pie.d.ts | 88 |
| PieCoordinate | Pie.d.ts | 89 |
| RadarPoint | Radar.d.ts | 6 |
| RadarDot | Radar.d.ts | 17 |
| RadiusAxisForRadar | Radar.d.ts | 43 |
| AngleAxisForRadar | Radar.d.ts | 46 |
| RadarComposedData | Radar.d.ts | 54 |
| Radar | Radar.d.ts | 66 |
| RadialBarDataItem | RadialBar.d.ts | 11 |
| RadialBarBackground | RadialBar.d.ts | 16 |
| RadialBar | RadialBar.d.ts | 71 |
| BrushStartEndIndex | brushUpdateContext.d.ts | 1 |
| OnBrushUpdate | brushUpdateContext.d.ts | 5 |
| BrushTravellerType | Brush.d.ts | 5 |
| BrushTickFormatter | Brush.d.ts | 6 |
| XAxis | XAxis.d.ts | 29 |
| YAxis | YAxis.d.ts | 30 |
| Segment | ReferenceLine.d.ts | 18 |
| ReferenceLinePosition | ReferenceLine.d.ts | 22 |
| ReferenceLine | ReferenceLine.d.ts | 49 |
| ReferenceDot | ReferenceDot.d.ts | 23 |
| ReferenceArea | ReferenceArea.d.ts | 19 |
| ZAxis | ZAxis.d.ts | 22 |
| TreemapDataType | Treemap.d.ts | 7 |
| TreemapNode | Treemap.d.ts | 15 |
| LinkDataItem | Sankey.d.ts | 7 |
| SankeyData | Sankey.d.ts | 36 |
| SankeyNodeOptions | Sankey.d.ts | 40 |
| SankeyLinkOptions | Sankey.d.ts | 41 |
| SankeyElementType | Sankey.d.ts | 64 |
| State | Sankey.d.ts | 65 |
| Sankey | Sankey.d.ts | 81 |
| SunburstData | SunburstChart.d.ts | 4 |
| TextOptions | SunburstChart.d.ts | 12 |
| FunnelTrapezoidItem | Funnel.d.ts | 6 |
| RealFunnelData | Funnel.d.ts | 63 |
| FunnelComposedData | Funnel.d.ts | 64 |
| FunnelWithState | Funnel.d.ts | 68 |
| Funnel | Funnel.d.ts | 81 |
| Decimal | decimal.d.ts | 3 |
| Config | decimal.d.ts | 562 |
| Numeric | decimal.d.ts | 570 |
| ChartOffset | types.d.ts | 6 |
| PlotArea | types.d.ts | 32 |
| PerformanceMetrics | core.ts | 10 |
| CalculatedRates | core.ts | 33 |
| TimeSeriesDataPoint | core.ts | 54 |
| BaseAnalytics | core.ts | 66 |
| AnalyticsFilters | core.ts | 83 |
| DataGranularity | core.ts | 107 |
| AnalyticsComputeOptions | core.ts | 112 |
| FilteredDataset | core.ts | 128 |
| CampaignAnalytics | domain-specific.ts | 11 |
| DomainAnalytics | domain-specific.ts | 30 |
| MailboxAnalytics | domain-specific.ts | 49 |
| LeadAnalytics | domain-specific.ts | 73 |
| TemplateAnalytics | domain-specific.ts | 90 |
| BillingAnalytics | domain-specific.ts | 106 |
| CampaignStatus | domain-specific.ts | 132 |
| WarmupStatus | domain-specific.ts | 134 |
| LeadStatus | domain-specific.ts | 136 |
| SequenceStepAnalytics | domain-specific.ts | 141 |
| WarmupAnalytics | domain-specific.ts | 156 |
| DailyWarmupStats | domain-specific.ts | 174 |
| DateRangePreset | ui.ts | 10 |
| AnalyticsUIFilters | ui.ts | 15 |
| AnalyticsMetricConfig | ui.ts | 58 |
| KPIDisplayConfig | ui.ts | 76 |
| ChartDataPoint | ui.ts | 103 |
| SmartInsightDisplay | ui.ts | 115 |
| AnalyticsLoadingState | ui.ts | 137 |
| AnalyticsDomain | ui.ts | 151 |
| FormattedAnalyticsStats | ui.ts | 216 |
| PerformanceThresholds | ui.ts | 234 |
| DataGranularity | analytics.ts | 71 |
| DateRangePreset | analytics.ts | 76 |
| ChartDataPoint | analytics.ts | 113 |
| AnalyticsStatistics | analytics.ts | 157 |
| KPIMetric | analytics.ts | 171 |
| CampaignFilter | analytics.ts | 231 |
| WarmupChartData | analytics.ts | 247 |
| WarmupMetric | analytics.ts | 261 |
| DailyWarmupStats | analytics.ts | 279 |
| MailboxWarmupData | analytics.ts | 299 |
| ProgressiveAnalyticsState | analytics.ts | 323 |
| MailboxAnalyticsData | analytics.ts | 334 |
| AnalyticsContextState | analytics.ts | 358 |
| AnalyticsFilterState | analytics.ts | 436 |
| AnalyticsFilters | analytics.ts | 483 |
| PerformanceTracking | analytics.ts | 544 |
| SmartInsight | analytics.ts | 613 |
| AccountMetrics | analytics.ts | 634 |
| FormFieldContextValue | ui.ts | 18 |
| FormItemContextValue | ui.ts | 27 |
| ChartConfig | ui.ts | 35 |
| PieChartDataPoint | ui.ts | 103 |
| LexicalEditorRef | ui.ts | 128 |
| TeamRole | team.ts | 6 |
| TeamMemberStatus | team.ts | 9 |
| TeamPermission | team.ts | 12 |
| TeamMember | team.ts | 27 |
| TeamInvite | team.ts | 44 |
| TeamActivity | team.ts | 59 |
| Team | team.ts | 89 |
| TeamStats | team.ts | 105 |
| InviteTeamMemberForm | team.ts | 119 |
| UpdateTeamMemberForm | team.ts | 126 |
| UpdateTeamSettingsForm | team.ts | 132 |
| BulkInviteResult | team.ts | 144 |
| BulkRemoveResult | team.ts | 152 |
| ID | common.ts | 3 |
| Timestamp | common.ts | 5 |
| Status | common.ts | 7 |
| DisplayStatus | common.ts | 9 |
| PaginationParams | common.ts | 22 |
| SelectOption | common.ts | 42 |
| MetricData | common.ts | 48 |
| ActionResult | common.ts | 61 |
| ActionResult | base.ts | 16 |
| CompanyInfo | base.ts | 19 |
| BillingAddress | base.ts | 28 |
| FieldValidationError | base.ts | 74 |
| SettingsValidationResult | base.ts | 80 |
| DeepPartial | base.ts | 87 |
| UserProfileData | user.ts | 8 |
| UserSettings | user.ts | 18 |
| UserPreferences | user.ts | 25 |
| AppearanceSettings | user.ts | 36 |
| GeneralSettings | user.ts | 45 |
| UserSettingsFormValues | user.ts | 77 |
| UserSettingsUpdate | user.ts | 101 |
| CreateUserSettings | user.ts | 104 |
| SubscriptionPlan | billing.ts | 12 |
| PaymentMethod | billing.ts | 28 |
| UsageMetrics | billing.ts | 40 |
| BillingHistoryItem | billing.ts | 51 |
| BillingInfo | billing.ts | 61 |
| BillingData | billing.ts | 72 |
| BillingAndPlanSettings | billing.ts | 101 |
| BillingInfoFormValues | billing.ts | 141 |
| BillingInfoUpdate | billing.ts | 165 |
| CreateBillingInfo | billing.ts | 168 |
| PasswordStrength | security.ts | 9 |
| TwoFactorFormValues | security.ts | 24 |
| SecuritySettings | security.ts | 37 |
| SecurityEvent | security.ts | 46 |
| SecurityRecommendation | security.ts | 56 |
| PasswordFormValues | security.ts | 81 |
| NotificationData | notifications.ts | 8 |
| NotificationPreferences | notifications.ts | 22 |
| NotificationFormValues | notifications.ts | 44 |
| NotificationPreferencesUpdate | notifications.ts | 88 |
| CreateNotificationPreferences | notifications.ts | 91 |
| TeamMember | team.ts | 9 |
| TeamMemberFormValues | team.ts | 31 |
| TeamMemberUpdate | team.ts | 59 |
| CreateTeamMember | team.ts | 62 |
| ClientPreferences | appearance.ts | 9 |
| StoredClientPreferences | appearance.ts | 25 |
| ClientPreferencesFormValues | appearance.ts | 54 |
| TrackingSettings | tracking.ts | 9 |
| ComplianceSettings | tracking.ts | 19 |
| ComplianceData | tracking.ts | 29 |
| TrackingFormValues | tracking.ts | 53 |
| SettingsTab | navigation.ts | 6 |
| SettingsNavItem | navigation.ts | 17 |
| SettingsValidationError | navigation.ts | 30 |
| SettingsApiError | navigation.ts | 37 |
| SettingsData | consolidated.ts | 20 |
| AllSettings | consolidated.ts | 82 |
| EmailAccount | accounts.ts | 1 |
| AccountStatsDataPoint | accounts.ts | 30 |
| AccountDetails | accounts.ts | 41 |
| WarmupAccount | accounts.ts | 58 |
| WarmupStatsDataPoint | accounts.ts | 73 |
| AdminUser | admin.ts | 18 |
| RegularUser | admin.ts | 35 |
| AuditLogEntry | admin.ts | 54 |
| BillingAnalytics | billing.ts | 11 |
| UsageData | billing.ts | 26 |
| CostData | billing.ts | 39 |
| UsageMetrics | billing.ts | 49 |
| UsagePercentages | billing.ts | 62 |
| CostAnalytics | billing.ts | 71 |
| CostTrend | billing.ts | 85 |
| PlanUtilizationData | billing.ts | 91 |
| UtilizationPercentages | billing.ts | 102 |
| UsageLimitAlert | billing.ts | 112 |
| AlertType | billing.ts | 124 |
| ResourceType | billing.ts | 129 |
| BillingTimeSeriesDataPoint | billing.ts | 145 |
| TimeSeriesUsageData | billing.ts | 156 |
| TimeSeriesCostData | billing.ts | 166 |
| BillingAnalyticsUpdateData | billing.ts | 176 |
| PlanLimits | billing.ts | 187 |
| BillingAnalyticsInitData | billing.ts | 196 |
| AlertThresholds | billing.ts | 206 |
| BillingMigrationResult | billing.ts | 216 |
| BillingBatchResult | billing.ts | 225 |
| BillingOperationResult | billing.ts | 234 |
| PaymentMethodType | billing.ts | 9 |
| PaymentProvider | billing.ts | 15 |
| CardBrand | billing.ts | 21 |
| SubscriptionStatus | billing.ts | 33 |
| BillingCycle | billing.ts | 44 |
| InvoiceStatus | billing.ts | 51 |
| UsageType | billing.ts | 61 |
| CompanyBilling | billing.ts | 74 |
| BillingAddress | billing.ts | 99 |
| PaymentMethod | billing.ts | 108 |
| Invoice | billing.ts | 133 |
| InvoiceLineItem | billing.ts | 161 |
| SubscriptionPlan | billing.ts | 172 |
| PlanComparison | billing.ts | 344 |
| UsageSummary | billing.ts | 361 |
| BillingSummary | billing.ts | 373 |
| CampaignFormValues | campaigns.ts | 11 |
| CampaignSteps | campaigns.ts | 22 |
| PartialCampaignStep | campaigns.ts | 24 |
| DNSRecordType | domain.ts | 4 |
| DNSRecordStatus | domain.ts | 16 |
| DNSRecord | domain.ts | 18 |
| DomainStatus | domain.ts | 28 |
| EmailAccountStatus | domain.ts | 36 |
| VerificationStatus | domain.ts | 44 |
| RelayType | domain.ts | 62 |
| DomainAccountCreationType | domain.ts | 69 |
| WarmupStatusType | domain.ts | 75 |
| DNSProvider | domain.ts | 78 |
| Domain | domain.ts | 91 |
| EmailAccount | domain.ts | 123 |
| SPFConfig | domain.ts | 143 |
| DKIMConfig | domain.ts | 149 |
| DMARCConfig | domain.ts | 155 |
| DomainAuthentication | domain.ts | 163 |
| WarmupConfig | domain.ts | 170 |
| ReputationFactors | domain.ts | 182 |
| DomainSettings | domain.ts | 189 |
| AddDomainFormType | domain.ts | 231 |
| DomainSettingsFormType | domain.ts | 246 |
| CampaignStepValues | forms.ts | 236 |
| CampaignFormValues | forms.ts | 237 |
| TemplateFormValues | forms.ts | 238 |
| NewFolderFormValues | forms.ts | 239 |
| ContactFormValues | forms.ts | 240 |
| DomainFormValues | forms.ts | 241 |
| EmailAccountFormValues | forms.ts | 242 |
| ProfileFormValues | forms.ts | 243 |
| PasswordSettingsFormValues | forms.ts | 244 |
| FormFieldError | forms.ts | 247 |
| FormValidationResult | forms.ts | 253 |
| FieldValidationType | forms.ts | 259 |
| EmailsType | inbox.ts | 77 |
| Email | inbox.ts | 78 |
| Campaign | inbox.ts | 79 |
| Client | inbox.ts | 80 |
| OnboardingStep | onboarding.ts | 3 |
| EventType | toolbar.ts | 24 |
| PluginItem | toolbar.ts | 30 |
| MapLike | index.d.ts | 4 |
| ARIARoleDefinitionKey | index.d.ts | 13 |
| DOMDefinition | index.d.ts | 16 |
| ARIAAbstractRole | index.d.ts | 26 |
| ARIAWidgetRole | index.d.ts | 40 |
| ARIACompositeWidgetRole | index.d.ts | 61 |
| ARIADocumentStructureRole | index.d.ts | 72 |
| ARIALandmarkRole | index.d.ts | 112 |
| ARIALiveRegionRole | index.d.ts | 122 |
| ARIAWindowRole | index.d.ts | 124 |
| ARIAUncategorizedRole | index.d.ts | 126 |
| ARIADPubRole | index.d.ts | 128 |
| ARIARole | index.d.ts | 169 |
| ARIARoleDefinition | index.d.ts | 178 |
| ARIAState | index.d.ts | 201 |
| ARIAProperty | index.d.ts | 212 |
| ARIAPropertyMap | index.d.ts | 254 |
| ARIAPropertyDefinition | index.d.ts | 306 |
| ARIAPropertyCurrent | index.d.ts | 312 |
| ARIARoleRelation | index.d.ts | 314 |
| ARIARoleRelationConcept | index.d.ts | 322 |
| ARIARoleRelationConceptAttribute | index.d.ts | 337 |
| ReturnedChild | index.d.ts | 3 |
| BaseComment | index.d.ts | 341 |
| Position | index.d.ts | 349 |
| CommentBlock | index.d.ts | 354 |
| CommentLine | index.d.ts | 357 |
| Comment | index.d.ts | 360 |
| SourceLocation | index.d.ts | 361 |
| BaseNode | index.d.ts | 367 |
| CommentTypeShorthand | index.d.ts | 378 |
| Node | index.d.ts | 379 |
| ArrayExpression | index.d.ts | 380 |
| AssignmentExpression | index.d.ts | 384 |
| BinaryExpression | index.d.ts | 390 |
| InterpreterDirective | index.d.ts | 396 |
| Directive | index.d.ts | 400 |
| DirectiveLiteral | index.d.ts | 404 |
| BlockStatement | index.d.ts | 408 |
| BreakStatement | index.d.ts | 413 |
| CallExpression | index.d.ts | 417 |
| CatchClause | index.d.ts | 425 |
| ConditionalExpression | index.d.ts | 430 |
| ContinueStatement | index.d.ts | 436 |
| DebuggerStatement | index.d.ts | 440 |
| DoWhileStatement | index.d.ts | 443 |
| EmptyStatement | index.d.ts | 448 |
| ExpressionStatement | index.d.ts | 451 |
| File | index.d.ts | 455 |
| ForInStatement | index.d.ts | 461 |
| ForStatement | index.d.ts | 467 |
| FunctionDeclaration | index.d.ts | 474 |
| FunctionExpression | index.d.ts | 486 |
| Identifier | index.d.ts | 497 |
| IfStatement | index.d.ts | 504 |
| LabeledStatement | index.d.ts | 510 |
| StringLiteral | index.d.ts | 515 |
| NumericLiteral | index.d.ts | 519 |
| NumberLiteral$1 | index.d.ts | 526 |
| NullLiteral | index.d.ts | 530 |
| BooleanLiteral | index.d.ts | 533 |
| RegExpLiteral | index.d.ts | 537 |
| RegexLiteral$1 | index.d.ts | 545 |
| LogicalExpression | index.d.ts | 550 |
| MemberExpression | index.d.ts | 556 |
| NewExpression | index.d.ts | 563 |
| Program | index.d.ts | 571 |
| ObjectExpression | index.d.ts | 578 |
| ObjectMethod | index.d.ts | 582 |
| ObjectProperty | index.d.ts | 595 |
| RestElement | index.d.ts | 603 |
| RestProperty$1 | index.d.ts | 613 |
| ReturnStatement | index.d.ts | 620 |
| SequenceExpression | index.d.ts | 624 |
| ParenthesizedExpression | index.d.ts | 628 |
| SwitchCase | index.d.ts | 632 |
| SwitchStatement | index.d.ts | 637 |
| ThisExpression | index.d.ts | 642 |
| ThrowStatement | index.d.ts | 645 |
| TryStatement | index.d.ts | 649 |
| UnaryExpression | index.d.ts | 655 |
| UpdateExpression | index.d.ts | 661 |
| VariableDeclaration | index.d.ts | 667 |
| VariableDeclarator | index.d.ts | 673 |
| WhileStatement | index.d.ts | 679 |
| WithStatement | index.d.ts | 684 |
| AssignmentPattern | index.d.ts | 689 |
| ArrayPattern | index.d.ts | 697 |
| ArrowFunctionExpression | index.d.ts | 704 |
| ClassBody | index.d.ts | 715 |
| ClassExpression | index.d.ts | 719 |
| ClassDeclaration | index.d.ts | 730 |
| ExportAllDeclaration | index.d.ts | 743 |
| ExportDefaultDeclaration | index.d.ts | 751 |
| ExportNamedDeclaration | index.d.ts | 756 |
| ExportSpecifier | index.d.ts | 766 |
| ForOfStatement | index.d.ts | 772 |
| ImportDeclaration | index.d.ts | 779 |
| ImportDefaultSpecifier | index.d.ts | 790 |
| ImportNamespaceSpecifier | index.d.ts | 794 |
| ImportSpecifier | index.d.ts | 798 |
| ImportExpression | index.d.ts | 804 |
| MetaProperty | index.d.ts | 810 |
| ClassMethod | index.d.ts | 815 |
| ObjectPattern | index.d.ts | 834 |
| SpreadElement | index.d.ts | 841 |
| SpreadProperty$1 | index.d.ts | 848 |
| Super | index.d.ts | 852 |
| TaggedTemplateExpression | index.d.ts | 855 |
| TemplateElement | index.d.ts | 861 |
| TemplateLiteral | index.d.ts | 869 |
| YieldExpression | index.d.ts | 874 |
| AwaitExpression | index.d.ts | 879 |
| Import | index.d.ts | 883 |
| BigIntLiteral | index.d.ts | 886 |
| ExportNamespaceSpecifier | index.d.ts | 890 |
| OptionalMemberExpression | index.d.ts | 894 |
| OptionalCallExpression | index.d.ts | 901 |
| ClassProperty | index.d.ts | 909 |
| ClassAccessorProperty | index.d.ts | 926 |
| ClassPrivateProperty | index.d.ts | 943 |
| ClassPrivateMethod | index.d.ts | 955 |
| PrivateName | index.d.ts | 974 |
| StaticBlock | index.d.ts | 978 |
| ImportAttribute | index.d.ts | 982 |
| AnyTypeAnnotation | index.d.ts | 987 |
| ArrayTypeAnnotation | index.d.ts | 990 |
| BooleanTypeAnnotation | index.d.ts | 994 |
| BooleanLiteralTypeAnnotation | index.d.ts | 997 |
| NullLiteralTypeAnnotation | index.d.ts | 1001 |
| ClassImplements | index.d.ts | 1004 |
| DeclareClass | index.d.ts | 1009 |
| DeclareFunction | index.d.ts | 1018 |
| DeclareInterface | index.d.ts | 1023 |
| DeclareModule | index.d.ts | 1030 |
| DeclareModuleExports | index.d.ts | 1036 |
| DeclareTypeAlias | index.d.ts | 1040 |
| DeclareOpaqueType | index.d.ts | 1046 |
| DeclareVariable | index.d.ts | 1053 |
| DeclareExportDeclaration | index.d.ts | 1057 |
| DeclareExportAllDeclaration | index.d.ts | 1067 |
| DeclaredPredicate | index.d.ts | 1075 |
| ExistsTypeAnnotation | index.d.ts | 1079 |
| FunctionTypeAnnotation | index.d.ts | 1082 |
| FunctionTypeParam | index.d.ts | 1090 |
| GenericTypeAnnotation | index.d.ts | 1096 |
| InferredPredicate | index.d.ts | 1101 |
| InterfaceExtends | index.d.ts | 1104 |
| InterfaceDeclaration | index.d.ts | 1109 |
| InterfaceTypeAnnotation | index.d.ts | 1116 |
| IntersectionTypeAnnotation | index.d.ts | 1121 |
| MixedTypeAnnotation | index.d.ts | 1125 |
| EmptyTypeAnnotation | index.d.ts | 1128 |
| NullableTypeAnnotation | index.d.ts | 1131 |
| NumberLiteralTypeAnnotation | index.d.ts | 1135 |
| NumberTypeAnnotation | index.d.ts | 1139 |
| ObjectTypeAnnotation | index.d.ts | 1142 |
| ObjectTypeInternalSlot | index.d.ts | 1151 |
| ObjectTypeCallProperty | index.d.ts | 1159 |
| ObjectTypeIndexer | index.d.ts | 1164 |
| ObjectTypeProperty | index.d.ts | 1172 |
| ObjectTypeSpreadProperty | index.d.ts | 1183 |
| OpaqueType | index.d.ts | 1187 |
| QualifiedTypeIdentifier | index.d.ts | 1194 |
| StringLiteralTypeAnnotation | index.d.ts | 1199 |
| StringTypeAnnotation | index.d.ts | 1203 |
| SymbolTypeAnnotation | index.d.ts | 1206 |
| ThisTypeAnnotation | index.d.ts | 1209 |
| TupleTypeAnnotation | index.d.ts | 1212 |
| TypeofTypeAnnotation | index.d.ts | 1216 |
| TypeAlias | index.d.ts | 1220 |
| TypeAnnotation | index.d.ts | 1226 |
| TypeCastExpression | index.d.ts | 1230 |
| TypeParameter | index.d.ts | 1235 |
| TypeParameterDeclaration | index.d.ts | 1242 |
| TypeParameterInstantiation | index.d.ts | 1246 |
| UnionTypeAnnotation | index.d.ts | 1250 |
| Variance | index.d.ts | 1254 |
| VoidTypeAnnotation | index.d.ts | 1258 |
| EnumDeclaration | index.d.ts | 1261 |
| EnumBooleanBody | index.d.ts | 1266 |
| EnumNumberBody | index.d.ts | 1272 |
| EnumStringBody | index.d.ts | 1278 |
| EnumSymbolBody | index.d.ts | 1284 |
| EnumBooleanMember | index.d.ts | 1289 |
| EnumNumberMember | index.d.ts | 1294 |
| EnumStringMember | index.d.ts | 1299 |
| EnumDefaultedMember | index.d.ts | 1304 |
| IndexedAccessType | index.d.ts | 1308 |
| OptionalIndexedAccessType | index.d.ts | 1313 |
| JSXAttribute | index.d.ts | 1319 |
| JSXClosingElement | index.d.ts | 1324 |
| JSXElement | index.d.ts | 1328 |
| JSXEmptyExpression | index.d.ts | 1335 |
| JSXExpressionContainer | index.d.ts | 1338 |
| JSXSpreadChild | index.d.ts | 1342 |
| JSXIdentifier | index.d.ts | 1346 |
| JSXMemberExpression | index.d.ts | 1350 |
| JSXNamespacedName | index.d.ts | 1355 |
| JSXOpeningElement | index.d.ts | 1360 |
| JSXSpreadAttribute | index.d.ts | 1368 |
| JSXText | index.d.ts | 1372 |
| JSXFragment | index.d.ts | 1376 |
| JSXOpeningFragment | index.d.ts | 1382 |
| JSXClosingFragment | index.d.ts | 1385 |
| Noop | index.d.ts | 1388 |
| Placeholder | index.d.ts | 1391 |
| V8IntrinsicIdentifier | index.d.ts | 1399 |
| ArgumentPlaceholder | index.d.ts | 1403 |
| BindExpression | index.d.ts | 1406 |
| Decorator | index.d.ts | 1411 |
| DoExpression | index.d.ts | 1415 |
| ExportDefaultSpecifier | index.d.ts | 1420 |
| RecordExpression | index.d.ts | 1424 |
| TupleExpression | index.d.ts | 1428 |
| DecimalLiteral | index.d.ts | 1432 |
| ModuleExpression | index.d.ts | 1436 |
| TopicReference | index.d.ts | 1440 |
| PipelineTopicExpression | index.d.ts | 1443 |
| PipelineBareFunction | index.d.ts | 1447 |
| PipelinePrimaryTopicReference | index.d.ts | 1451 |
| VoidPattern | index.d.ts | 1454 |
| TSParameterProperty | index.d.ts | 1457 |
| TSDeclareFunction | index.d.ts | 1465 |
| TSDeclareMethod | index.d.ts | 1475 |
| TSQualifiedName | index.d.ts | 1493 |
| TSCallSignatureDeclaration | index.d.ts | 1498 |
| TSConstructSignatureDeclaration | index.d.ts | 1504 |
| TSPropertySignature | index.d.ts | 1510 |
| TSMethodSignature | index.d.ts | 1519 |
| TSIndexSignature | index.d.ts | 1529 |
| TSAnyKeyword | index.d.ts | 1536 |
| TSBooleanKeyword | index.d.ts | 1539 |
| TSBigIntKeyword | index.d.ts | 1542 |
| TSIntrinsicKeyword | index.d.ts | 1545 |
| TSNeverKeyword | index.d.ts | 1548 |
| TSNullKeyword | index.d.ts | 1551 |
| TSNumberKeyword | index.d.ts | 1554 |
| TSObjectKeyword | index.d.ts | 1557 |
| TSStringKeyword | index.d.ts | 1560 |
| TSSymbolKeyword | index.d.ts | 1563 |
| TSUndefinedKeyword | index.d.ts | 1566 |
| TSUnknownKeyword | index.d.ts | 1569 |
| TSVoidKeyword | index.d.ts | 1572 |
| TSThisType | index.d.ts | 1575 |
| TSFunctionType | index.d.ts | 1578 |
| TSConstructorType | index.d.ts | 1584 |
| TSTypeReference | index.d.ts | 1591 |
| TSTypePredicate | index.d.ts | 1596 |
| TSTypeQuery | index.d.ts | 1602 |
| TSTypeLiteral | index.d.ts | 1607 |
| TSArrayType | index.d.ts | 1611 |
| TSTupleType | index.d.ts | 1615 |
| TSOptionalType | index.d.ts | 1619 |
| TSRestType | index.d.ts | 1623 |
| TSNamedTupleMember | index.d.ts | 1627 |
| TSUnionType | index.d.ts | 1633 |
| TSIntersectionType | index.d.ts | 1637 |
| TSConditionalType | index.d.ts | 1641 |
| TSInferType | index.d.ts | 1648 |
| TSParenthesizedType | index.d.ts | 1652 |
| TSTypeOperator | index.d.ts | 1656 |
| TSIndexedAccessType | index.d.ts | 1661 |
| TSMappedType | index.d.ts | 1666 |
| TSTemplateLiteralType | index.d.ts | 1674 |
| TSLiteralType | index.d.ts | 1679 |
| TSExpressionWithTypeArguments | index.d.ts | 1683 |
| TSInterfaceDeclaration | index.d.ts | 1688 |
| TSInterfaceBody | index.d.ts | 1696 |
| TSTypeAliasDeclaration | index.d.ts | 1700 |
| TSInstantiationExpression | index.d.ts | 1707 |
| TSAsExpression | index.d.ts | 1712 |
| TSSatisfiesExpression | index.d.ts | 1717 |
| TSTypeAssertion | index.d.ts | 1722 |
| TSEnumBody | index.d.ts | 1727 |
| TSEnumDeclaration | index.d.ts | 1731 |
| TSEnumMember | index.d.ts | 1740 |
| TSModuleDeclaration | index.d.ts | 1745 |
| TSModuleBlock | index.d.ts | 1753 |
| TSImportType | index.d.ts | 1757 |
| TSImportEqualsDeclaration | index.d.ts | 1764 |
| TSExternalModuleReference | index.d.ts | 1771 |
| TSNonNullExpression | index.d.ts | 1775 |
| TSExportAssignment | index.d.ts | 1779 |
| TSNamespaceExportDeclaration | index.d.ts | 1783 |
| TSTypeAnnotation | index.d.ts | 1787 |
| TSTypeParameterInstantiation | index.d.ts | 1791 |
| TSTypeParameterDeclaration | index.d.ts | 1795 |
| TSTypeParameter | index.d.ts | 1799 |
| Standardized | index.d.ts | 1808 |
| Expression | index.d.ts | 1809 |
| Binary | index.d.ts | 1810 |
| Scopable | index.d.ts | 1811 |
| BlockParent | index.d.ts | 1812 |
| Block | index.d.ts | 1813 |
| Statement | index.d.ts | 1814 |
| Terminatorless | index.d.ts | 1815 |
| CompletionStatement | index.d.ts | 1816 |
| Conditional | index.d.ts | 1817 |
| Loop | index.d.ts | 1818 |
| While | index.d.ts | 1819 |
| ExpressionWrapper | index.d.ts | 1820 |
| For | index.d.ts | 1821 |
| ForXStatement | index.d.ts | 1822 |
| Function | index.d.ts | 1823 |
| FunctionParent | index.d.ts | 1824 |
| Pureish | index.d.ts | 1825 |
| Declaration | index.d.ts | 1826 |
| FunctionParameter | index.d.ts | 1827 |
| PatternLike | index.d.ts | 1828 |
| LVal | index.d.ts | 1829 |
| Literal | index.d.ts | 1831 |
| Immutable | index.d.ts | 1832 |
| UserWhitespacable | index.d.ts | 1833 |
| Method | index.d.ts | 1834 |
| ObjectMember | index.d.ts | 1835 |
| Property | index.d.ts | 1836 |
| UnaryLike | index.d.ts | 1837 |
| Pattern | index.d.ts | 1838 |
| Class | index.d.ts | 1839 |
| ImportOrExportDeclaration | index.d.ts | 1840 |
| ExportDeclaration | index.d.ts | 1841 |
| ModuleSpecifier | index.d.ts | 1842 |
| Accessor | index.d.ts | 1843 |
| Private | index.d.ts | 1844 |
| Flow | index.d.ts | 1845 |
| FlowType | index.d.ts | 1846 |
| FlowBaseAnnotation | index.d.ts | 1847 |
| FlowDeclaration | index.d.ts | 1848 |
| FlowPredicate | index.d.ts | 1849 |
| EnumBody | index.d.ts | 1850 |
| EnumMember | index.d.ts | 1851 |
| JSX | index.d.ts | 1852 |
| Miscellaneous | index.d.ts | 1853 |
| TypeScript | index.d.ts | 1854 |
| TSTypeElement | index.d.ts | 1855 |
| TSType | index.d.ts | 1856 |
| TSBaseType | index.d.ts | 1857 |
| ModuleDeclaration | index.d.ts | 1858 |
| Aliases | index.d.ts | 1859 |
| DeprecatedAliases | index.d.ts | 1912 |
| ParentMaps | index.d.ts | 1913 |
| NodeTypesWithoutComment | index.d.ts | 2731 |
| NodeTypes | index.d.ts | 2732 |
| PrimitiveTypes | index.d.ts | 2733 |
| FieldDefinitions | index.d.ts | 2734 |
| Validator | index.d.ts | 2737 |
| FieldOptions | index.d.ts | 2756 |
| Options | index.d.ts | 2789 |
| KeysMap | index.d.ts | 2825 |
| GetFunctionNameResult | index.d.ts | 2837 |
| TraversalAncestors | index.d.ts | 2844 |
| TraversalHandler | index.d.ts | 2849 |
| TraversalHandlers | index.d.ts | 2850 |
| Opts | index.d.ts | 2974 |
| GeneratorOptions | index.d.ts | 3 |
| CodeGenerator | index.d.ts | 179 |
| GeneratorResult | index.d.ts | 199 |
| BABEL_8_BREAKING | babel-parser.d.ts | 6 |
| IF_BABEL_7 | babel-parser.d.ts | 7 |
| Plugin$1 | babel-parser.d.ts | 9 |
| ParserPluginWithOptions | babel-parser.d.ts | 55 |
| PluginConfig | babel-parser.d.ts | 67 |
| DecoratorsPluginOptions | babel-parser.d.ts | 69 |
| PipelineOperatorPluginOptions | babel-parser.d.ts | 74 |
| RecordAndTuplePluginOptions | babel-parser.d.ts | 81 |
| FlowPluginOptions | babel-parser.d.ts | 85 |
| TypeScriptPluginOptions | babel-parser.d.ts | 94 |
| Plugin | babel-parser.d.ts | 99 |
| SourceType | babel-parser.d.ts | 101 |
| Options | babel-parser.d.ts | 102 |
| ParserOptions | babel-parser.d.ts | 220 |
| ParseError | babel-parser.d.ts | 221 |
| ParseResult | babel-parser.d.ts | 225 |
| TemplateBuilderOptions | index.d.ts | 4 |
| TemplateBuilder | index.d.ts | 45 |
| PublicReplacements | index.d.ts | 73 |
| DefaultTemplateBuilder | index.d.ts | 81 |
| TraverseOptions | index.d.ts | 72 |
| Scope | index.d.ts | 81 |
| BindingKind | index.d.ts | 260 |
| Binding | index.d.ts | 272 |
| Visitor | index.d.ts | 299 |
| VisitNode | index.d.ts | 317 |
| VisitNodeFunction | index.d.ts | 319 |
| NodeType | index.d.ts | 321 |
| VisitNodeObject | index.d.ts | 323 |
| NodeKeyOfArrays | index.d.ts | 328 |
| NodeKeyOfNodes | index.d.ts | 332 |
| NodePaths | index.d.ts | 336 |
| NodeListType | index.d.ts | 341 |
| NodesInsertionParam | index.d.ts | 343 |
| NodePath | index.d.ts | 345 |
| HubInterface | index.d.ts | 1442 |
| Hub | index.d.ts | 1449 |
| TraversalContext | index.d.ts | 1457 |
| ImplGetOfArray | index.d.ts | 1466 |
| ImplGetByKey | index.d.ts | 1472 |
| ImplGetRecursive | index.d.ts | 1480 |
| NodePathResult | index.d.ts | 1485 |
| VirtualTypeAliases | index.d.ts | 1489 |
| Node | index.d.ts | 9 |
| ParseResult | index.d.ts | 10 |
| TransformOptions | index.d.ts | 29 |
| TransformCaller | index.d.ts | 394 |
| FileResultCallback | index.d.ts | 405 |
| MatchPatternContext | index.d.ts | 407 |
| MatchPattern | index.d.ts | 412 |
| PluginObj | index.d.ts | 492 |
| BabelFile | index.d.ts | 501 |
| PluginPass | index.d.ts | 512 |
| BabelFileResult | index.d.ts | 523 |
| BabelFileMetadata | index.d.ts | 542 |
| BabelFileModulesMetadata | index.d.ts | 552 |
| FileParseCallback | index.d.ts | 560 |
| PartialConfig | index.d.ts | 628 |
| ConfigItem | index.d.ts | 636 |
| PluginOptions | index.d.ts | 677 |
| PluginTarget | index.d.ts | 679 |
| PluginItem | index.d.ts | 681 |
| CreateConfigItemOptions | index.d.ts | 691 |
| ConfigAPI | index.d.ts | 710 |
| SimpleCacheConfigurator | index.d.ts | 772 |
| SimpleCacheKey | index.d.ts | 804 |
| SimpleCacheCallback | index.d.ts | 805 |
| EnvFunction | index.d.ts | 814 |
| ConfigFunction | index.d.ts | 829 |
| Primitive | index.d.ts | 10 |
| Numeric | index.d.ts | 15 |
| Matrix | index.d.ts | 23 |
| NestedInternMap | index.d.ts | 36 |
| NestedArray | index.d.ts | 47 |
| Adder | index.d.ts | 368 |
| Bisector | index.d.ts | 461 |
| Bin | index.d.ts | 946 |
| ThresholdCountGenerator | index.d.ts | 954 |
| ThresholdNumberArrayGenerator | index.d.ts | 963 |
| ThresholdDateArrayGenerator | index.d.ts | 972 |
| HistogramCommon | index.d.ts | 978 |
| HistogramGeneratorDate | index.d.ts | 985 |
| HistogramGeneratorNumber | index.d.ts | 1005 |
| InternMap | index.d.ts | 1080 |
| InternSet | index.d.ts | 1086 |
| ColorSpaceObject | index.d.ts | 10 |
| ColorCommonInstance | index.d.ts | 16 |
| Color | index.d.ts | 59 |
| ColorFactory | index.d.ts | 103 |
| RGBColor | index.d.ts | 126 |
| RGBColorFactory | index.d.ts | 185 |
| HSLColor | index.d.ts | 219 |
| HSLColorFactory | index.d.ts | 277 |
| LabColor | index.d.ts | 312 |
| LabColorFactory | index.d.ts | 366 |
| GrayColorFactory | index.d.ts | 402 |
| HCLColor | index.d.ts | 414 |
| HCLColorFactory | index.d.ts | 468 |
| LCHColorFactory | index.d.ts | 504 |
| CubehelixColor | index.d.ts | 536 |
| CubehelixColorFactory | index.d.ts | 590 |
| PolynomialEasingFactory | index.d.ts | 73 |
| BackEasingFactory | index.d.ts | 226 |
| ElasticEasingFactory | index.d.ts | 268 |
| ZoomInterpolator | index.d.ts | 9 |
| ColorGammaInterpolationFactory | index.d.ts | 25 |
| ZoomView | index.d.ts | 42 |
| TypedArray | index.d.ts | 44 |
| NumberArray | index.d.ts | 55 |
| ArrayInterpolator | index.d.ts | 145 |
| TimeInterval | index.d.ts | 10 |
| CountableTimeInterval | index.d.ts | 125 |
| InterpolatorFactory | index.d.ts | 15 |
| NumberValue | index.d.ts | 25 |
| UnknownReturnType | index.d.ts | 27 |
| ScaleContinuousNumeric | index.d.ts | 32 |
| ScaleLinear | index.d.ts | 200 |
| ScalePower | index.d.ts | 317 |
| ScaleLogarithmic | index.d.ts | 498 |
| ScaleSymLog | index.d.ts | 690 |
| ScaleRadial | index.d.ts | 917 |
| ScaleTime | index.d.ts | 984 |
| ScaleSequentialBase | index.d.ts | 1312 |
| ScaleSequential | index.d.ts | 1374 |
| ScaleSequentialQuantile | index.d.ts | 1549 |
| ScaleDiverging | index.d.ts | 1628 |
| ScaleQuantize | index.d.ts | 1872 |
| ScaleQuantile | index.d.ts | 2019 |
| ScaleThreshold | index.d.ts | 2133 |
| ScaleOrdinal | index.d.ts | 2242 |
| ScaleBand | index.d.ts | 2368 |
| ScalePoint | index.d.ts | 2535 |
| Timer | index.d.ts | 11 |
| BaseNodeWithoutComments | index.d.ts | 19 |
| BaseNode | index.d.ts | 28 |
| NodeMap | index.d.ts | 33 |
| Node | index.d.ts | 58 |
| Comment | index.d.ts | 60 |
| SourceLocation | index.d.ts | 65 |
| Position | index.d.ts | 71 |
| Program | index.d.ts | 78 |
| Directive | index.d.ts | 85 |
| BaseFunction | index.d.ts | 91 |
| Function | index.d.ts | 101 |
| Statement | index.d.ts | 103 |
| BaseStatement | index.d.ts | 125 |
| EmptyStatement | index.d.ts | 127 |
| BlockStatement | index.d.ts | 131 |
| StaticBlock | index.d.ts | 137 |
| ExpressionStatement | index.d.ts | 141 |
| IfStatement | index.d.ts | 146 |
| LabeledStatement | index.d.ts | 153 |
| BreakStatement | index.d.ts | 159 |
| ContinueStatement | index.d.ts | 164 |
| WithStatement | index.d.ts | 169 |
| SwitchStatement | index.d.ts | 175 |
| ReturnStatement | index.d.ts | 181 |
| ThrowStatement | index.d.ts | 186 |
| TryStatement | index.d.ts | 191 |
| WhileStatement | index.d.ts | 198 |
| DoWhileStatement | index.d.ts | 204 |
| ForStatement | index.d.ts | 210 |
| BaseForXStatement | index.d.ts | 218 |
| ForInStatement | index.d.ts | 224 |
| DebuggerStatement | index.d.ts | 228 |
| Declaration | index.d.ts | 232 |
| BaseDeclaration | index.d.ts | 234 |
| MaybeNamedFunctionDeclaration | index.d.ts | 236 |
| FunctionDeclaration | index.d.ts | 243 |
| VariableDeclaration | index.d.ts | 247 |
| VariableDeclarator | index.d.ts | 253 |
| ExpressionMap | index.d.ts | 259 |
| Expression | index.d.ts | 287 |
| BaseExpression | index.d.ts | 289 |
| ChainElement | index.d.ts | 291 |
| ChainExpression | index.d.ts | 293 |
| ThisExpression | index.d.ts | 298 |
| ArrayExpression | index.d.ts | 302 |
| ObjectExpression | index.d.ts | 307 |
| PrivateIdentifier | index.d.ts | 312 |
| Property | index.d.ts | 317 |
| PropertyDefinition | index.d.ts | 327 |
| FunctionExpression | index.d.ts | 335 |
| SequenceExpression | index.d.ts | 341 |
| UnaryExpression | index.d.ts | 346 |
| BinaryExpression | index.d.ts | 353 |
| AssignmentExpression | index.d.ts | 360 |
| UpdateExpression | index.d.ts | 367 |
| LogicalExpression | index.d.ts | 374 |
| ConditionalExpression | index.d.ts | 381 |
| BaseCallExpression | index.d.ts | 388 |
| CallExpression | index.d.ts | 392 |
| SimpleCallExpression | index.d.ts | 394 |
| NewExpression | index.d.ts | 399 |
| MemberExpression | index.d.ts | 403 |
| Pattern | index.d.ts | 411 |
| BasePattern | index.d.ts | 413 |
| SwitchCase | index.d.ts | 415 |
| CatchClause | index.d.ts | 421 |
| Identifier | index.d.ts | 427 |
| Literal | index.d.ts | 432 |
| SimpleLiteral | index.d.ts | 434 |
| RegExpLiteral | index.d.ts | 440 |
| BigIntLiteral | index.d.ts | 450 |
| UnaryOperator | index.d.ts | 457 |
| BinaryOperator | index.d.ts | 459 |
| LogicalOperator | index.d.ts | 483 |
| AssignmentOperator | index.d.ts | 485 |
| UpdateOperator | index.d.ts | 503 |
| ForOfStatement | index.d.ts | 505 |
| Super | index.d.ts | 510 |
| SpreadElement | index.d.ts | 514 |
| ArrowFunctionExpression | index.d.ts | 519 |
| YieldExpression | index.d.ts | 525 |
| TemplateLiteral | index.d.ts | 531 |
| TaggedTemplateExpression | index.d.ts | 537 |
| TemplateElement | index.d.ts | 543 |
| AssignmentProperty | index.d.ts | 553 |
| ObjectPattern | index.d.ts | 559 |
| ArrayPattern | index.d.ts | 564 |
| RestElement | index.d.ts | 569 |
| AssignmentPattern | index.d.ts | 574 |
| Class | index.d.ts | 580 |
| BaseClass | index.d.ts | 581 |
| ClassBody | index.d.ts | 586 |
| MethodDefinition | index.d.ts | 591 |
| MaybeNamedClassDeclaration | index.d.ts | 600 |
| ClassDeclaration | index.d.ts | 606 |
| ClassExpression | index.d.ts | 610 |
| MetaProperty | index.d.ts | 615 |
| ModuleDeclaration | index.d.ts | 621 |
| BaseModuleDeclaration | index.d.ts | 626 |
| ModuleSpecifier | index.d.ts | 628 |
| BaseModuleSpecifier | index.d.ts | 629 |
| ImportDeclaration | index.d.ts | 633 |
| ImportSpecifier | index.d.ts | 640 |
| ImportAttribute | index.d.ts | 645 |
| ImportExpression | index.d.ts | 651 |
| ImportDefaultSpecifier | index.d.ts | 657 |
| ImportNamespaceSpecifier | index.d.ts | 661 |
| ExportNamedDeclaration | index.d.ts | 665 |
| ExportSpecifier | index.d.ts | 673 |
| ExportDefaultDeclaration | index.d.ts | 679 |
| ExportAllDeclaration | index.d.ts | 684 |
| AwaitExpression | index.d.ts | 691 |
| CoverageSummaryData | index.d.ts | 1 |
| CoverageSummary | index.d.ts | 8 |
| CoverageMapData | index.d.ts | 20 |
| CoverageMap | index.d.ts | 24 |
| Location | index.d.ts | 36 |
| Range | index.d.ts | 41 |
| BranchMapping | index.d.ts | 46 |
| FunctionMapping | index.d.ts | 53 |
| FileCoverageData | index.d.ts | 60 |
| Totals | index.d.ts | 70 |
| Coverage | index.d.ts | 77 |
| FileCoverage | index.d.ts | 83 |
| ReportBase | index.d.ts | 12 |
| ReportBaseOptions | index.d.ts | 17 |
| Summarizers | index.d.ts | 21 |
| ContextOptions | index.d.ts | 23 |
| Context | index.d.ts | 31 |
| ContentWriter | index.d.ts | 66 |
| FileContentWriter | index.d.ts | 87 |
| ConsoleWriter | index.d.ts | 95 |
| FileWriter | index.d.ts | 102 |
| XmlWriter | index.d.ts | 122 |
| Watermark | index.d.ts | 142 |
| Watermarks | index.d.ts | 144 |
| Node | index.d.ts | 151 |
| ReportNode | index.d.ts | 156 |
| Visitor | index.d.ts | 173 |
| Tree | index.d.ts | 181 |
| FileOptions | index.d.ts | 5 |
| ProjectOptions | index.d.ts | 9 |
| ReportOptions | index.d.ts | 13 |
| ReportType | index.d.ts | 29 |
| CloverOptions | index.d.ts | 31 |
| CoberturaOptions | index.d.ts | 33 |
| HtmlSpaOptions | index.d.ts | 35 |
| HtmlOptions | index.d.ts | 38 |
| JsonOptions | index.d.ts | 45 |
| JsonSummaryOptions | index.d.ts | 46 |
| LcovOptions | index.d.ts | 48 |
| LcovOnlyOptions | index.d.ts | 49 |
| TeamcityOptions | index.d.ts | 51 |
| TextOptions | index.d.ts | 55 |
| TextLcovOptions | index.d.ts | 60 |
| TextSummaryOptions | index.d.ts | 61 |
| LinkMapper | index.d.ts | 63 |
| EqualsFunction | index.d.ts | 17 |
| GetPath | index.d.ts | 33 |
| Tester | index.d.ts | 82 |
| TesterContext | index.d.ts | 89 |
| ForegroundColor | index.d.ts | 6 |
| BackgroundColor | index.d.ts | 31 |
| Color | index.d.ts | 56 |
| Modifiers | index.d.ts | 58 |
| TAny | any.d.ts | 3 |
| TMappedKey | mapped-key.d.ts | 3 |
| TMappedResult | mapped-result.d.ts | 4 |
| TAsyncIterator | async-iterator.d.ts | 4 |
| TRemoveReadonly | readonly.d.ts | 6 |
| TAddReadonly | readonly.d.ts | 7 |
| TReadonlyWithFlag | readonly.d.ts | 8 |
| TReadonly | readonly.d.ts | 9 |
| TFromProperties | readonly-from-mapped-result.d.ts | 4 |
| TFromMappedResult | readonly-from-mapped-result.d.ts | 7 |
| TReadonlyFromMappedResult | readonly-from-mapped-result.d.ts | 8 |
| TReadonlyOptional | readonly-optional.d.ts | 4 |
| StaticReturnType | constructor.d.ts | 8 |
| StaticParameter | constructor.d.ts | 9 |
| StaticParameters | constructor.d.ts | 12 |
| StaticConstructor | constructor.d.ts | 13 |
| TConstructor | constructor.d.ts | 14 |
| TLiteralValue | literal.d.ts | 3 |
| TLiteral | literal.d.ts | 4 |
| TEnumRecord | enum.d.ts | 4 |
| TEnumValue | enum.d.ts | 5 |
| TEnumKey | enum.d.ts | 6 |
| TEnum | enum.d.ts | 7 |
| StaticReturnType | function.d.ts | 8 |
| StaticParameter | function.d.ts | 9 |
| StaticParameters | function.d.ts | 12 |
| StaticFunction | function.d.ts | 13 |
| TFunction | function.d.ts | 14 |
| TComputed | computed.d.ts | 3 |
| TNever | never.d.ts | 3 |
| TIntersectStatic | intersect-type.d.ts | 4 |
| TUnevaluatedProperties | intersect-type.d.ts | 5 |
| IntersectOptions | intersect-type.d.ts | 6 |
| TIntersect | intersect-type.d.ts | 9 |
| TIsIntersectOptional | intersect-evaluated.d.ts | 6 |
| TRemoveOptionalFromType | intersect-evaluated.d.ts | 7 |
| TRemoveOptionalFromRest | intersect-evaluated.d.ts | 8 |
| TResolveIntersect | intersect-evaluated.d.ts | 9 |
| TIntersectEvaluated | intersect-evaluated.d.ts | 10 |
| Intersect | intersect.d.ts | 4 |
| UnionStatic | union-type.d.ts | 4 |
| TUnion | union-type.d.ts | 7 |
| TIsUnionOptional | union-evaluated.d.ts | 6 |
| TRemoveOptionalFromRest | union-evaluated.d.ts | 7 |
| TRemoveOptionalFromType | union-evaluated.d.ts | 8 |
| TResolveUnion | union-evaluated.d.ts | 9 |
| TUnionEvaluated | union-evaluated.d.ts | 10 |
| Union | union.d.ts | 4 |
| TThis | recursive.d.ts | 4 |
| RecursiveStatic | recursive.d.ts | 9 |
| TRecursive | recursive.d.ts | 10 |
| UnsafeOptions | unsafe.d.ts | 3 |
| TUnsafe | unsafe.d.ts | 6 |
| TRef | ref.d.ts | 5 |
| TRefUnsafe | ref.d.ts | 10 |
| TupleStatic | tuple.d.ts | 4 |
| TTuple | tuple.d.ts | 5 |
| TypeBoxError | error.d.ts | 2 |
| StringFormatOption | string.d.ts | 3 |
| StringContentEncodingOption | string.d.ts | 4 |
| StringOptions | string.d.ts | 5 |
| TString | string.d.ts | 19 |
| TBoolean | boolean.d.ts | 3 |
| NumberOptions | number.d.ts | 3 |
| TNumber | number.d.ts | 10 |
| IntegerOptions | integer.d.ts | 3 |
| TInteger | integer.d.ts | 10 |
| BigIntOptions | bigint.d.ts | 3 |
| TBigInt | bigint.d.ts | 10 |
| TemplateLiteralParserError | parse.d.ts | 2 |
| Expression | parse.d.ts | 4 |
| ExpressionConst | parse.d.ts | 5 |
| ExpressionAnd | parse.d.ts | 9 |
| ExpressionOr | parse.d.ts | 13 |
| TemplateLiteralFiniteError | finite.d.ts | 11 |
| TFromTemplateLiteralKind | finite.d.ts | 13 |
| TFromTemplateLiteralKinds | finite.d.ts | 14 |
| TIsTemplateLiteralFinite | finite.d.ts | 16 |
| TemplateLiteralGenerateError | generate.d.ts | 9 |
| TStringReduceUnary | generate.d.ts | 11 |
| TStringReduceBinary | generate.d.ts | 12 |
| TStringReduceMany | generate.d.ts | 13 |
| TStringReduce | generate.d.ts | 14 |
| TFromTemplateLiteralUnionKinds | generate.d.ts | 15 |
| TFromTemplateLiteralKinds | generate.d.ts | 16 |
| TTemplateLiteralGenerate | generate.d.ts | 18 |
| FromUnionLiteral | syntax.d.ts | 11 |
| FromUnion | syntax.d.ts | 13 |
| FromTerminal | syntax.d.ts | 14 |
| FromString | syntax.d.ts | 15 |
| TTemplateLiteralSyntax | syntax.d.ts | 17 |
| TemplateLiteralPatternError | pattern.d.ts | 3 |
| TemplateLiteralStaticKind | template-literal.d.ts | 15 |
| TemplateLiteralStatic | template-literal.d.ts | 18 |
| TTemplateLiteralKind | template-literal.d.ts | 19 |
| TTemplateLiteral | template-literal.d.ts | 20 |
| TTemplateLiteralToUnionLiteralArray | union.d.ts | 6 |
| TTemplateLiteralToUnion | union.d.ts | 7 |
| TFromTemplateLiteral | indexed-property-keys.d.ts | 7 |
| TFromUnion | indexed-property-keys.d.ts | 8 |
| TFromLiteral | indexed-property-keys.d.ts | 9 |
| TIndexPropertyKeys | indexed-property-keys.d.ts | 10 |
| TFromProperties | indexed-from-mapped-result.d.ts | 6 |
| TFromMappedResult | indexed-from-mapped-result.d.ts | 9 |
| TIndexFromMappedResult | indexed-from-mapped-result.d.ts | 10 |
| TFromRest | indexed.d.ts | 18 |
| TFromIntersectRest | indexed.d.ts | 19 |
| TFromIntersect | indexed.d.ts | 20 |
| TFromUnionRest | indexed.d.ts | 21 |
| TFromUnion | indexed.d.ts | 22 |
| TFromTuple | indexed.d.ts | 23 |
| TFromArray | indexed.d.ts | 24 |
| AssertPropertyKey | indexed.d.ts | 25 |
| TFromProperty | indexed.d.ts | 26 |
| TIndexFromPropertyKey | indexed.d.ts | 27 |
| TIndexFromPropertyKeys | indexed.d.ts | 29 |
| TIndexFromComputed | indexed.d.ts | 33 |
| TIndex | indexed.d.ts | 35 |
| TMappedIndexPropertyKey | indexed-from-mapped-key.d.ts | 6 |
| TMappedIndexPropertyKeys | indexed-from-mapped-key.d.ts | 9 |
| TMappedIndexProperties | indexed-from-mapped-key.d.ts | 10 |
| TIndexFromMappedKey | indexed-from-mapped-key.d.ts | 11 |
| TIterator | iterator.d.ts | 4 |
| TPromise | promise.d.ts | 4 |
| TSetIncludes | set.d.ts | 1 |
| TSetIsSubset | set.d.ts | 4 |
| TSetDistinct | set.d.ts | 7 |
| TSetIntersect | set.d.ts | 10 |
| TSetUnion | set.d.ts | 13 |
| TSetComplement | set.d.ts | 19 |
| TSetIntersectManyResolve | set.d.ts | 22 |
| TSetIntersectMany | set.d.ts | 23 |
| TSetUnionMany | set.d.ts | 25 |
| TFromMappedResult | mapped.d.ts | 21 |
| TMappedKeyToKnownMappedResultProperties | mapped.d.ts | 22 |
| TMappedKeyToUnknownMappedResultProperties | mapped.d.ts | 25 |
| TMappedKeyToMappedResultProperties | mapped.d.ts | 28 |
| TFromMappedKey | mapped.d.ts | 29 |
| TFromRest | mapped.d.ts | 30 |
| FromProperties | mapped.d.ts | 31 |
| TMappedFunctionReturnType | mapped.d.ts | 37 |
| TMappedFunction | mapped.d.ts | 41 |
| TMapped | mapped.d.ts | 42 |
| TRemoveOptional | optional.d.ts | 6 |
| TAddOptional | optional.d.ts | 7 |
| TOptionalWithFlag | optional.d.ts | 8 |
| TOptional | optional.d.ts | 9 |
| TFromProperties | optional-from-mapped-result.d.ts | 4 |
| TFromMappedResult | optional-from-mapped-result.d.ts | 7 |
| TOptionalFromMappedResult | optional-from-mapped-result.d.ts | 8 |
| TFromComputed | awaited.d.ts | 8 |
| TFromRef | awaited.d.ts | 9 |
| TFromRest | awaited.d.ts | 10 |
| TAwaited | awaited.d.ts | 11 |
| TFromRest | keyof-property-keys.d.ts | 10 |
| TFromIntersect | keyof-property-keys.d.ts | 11 |
| TFromUnion | keyof-property-keys.d.ts | 12 |
| TFromTuple | keyof-property-keys.d.ts | 13 |
| TFromArray | keyof-property-keys.d.ts | 14 |
| TFromProperties | keyof-property-keys.d.ts | 17 |
| TKeyOfPropertyKeys | keyof-property-keys.d.ts | 18 |
| TFromComputed | keyof.d.ts | 12 |
| TFromRef | keyof.d.ts | 13 |
| TKeyOfFromType | keyof.d.ts | 15 |
| TKeyOfPropertyKeysToRest | keyof.d.ts | 16 |
| TKeyOf | keyof.d.ts | 18 |
| TFromProperties | keyof-from-mapped-result.d.ts | 6 |
| TFromMappedResult | keyof-from-mapped-result.d.ts | 9 |
| TKeyOfFromMappedResult | keyof-from-mapped-result.d.ts | 10 |
| TFromProperties | omit-from-mapped-result.d.ts | 6 |
| TFromMappedResult | omit-from-mapped-result.d.ts | 9 |
| TOmitFromMappedResult | omit-from-mapped-result.d.ts | 10 |
| TFromIntersect | omit.d.ts | 14 |
| TFromUnion | omit.d.ts | 15 |
| TFromProperties | omit.d.ts | 16 |
| TFromObject | omit.d.ts | 17 |
| TUnionFromPropertyKeys | omit.d.ts | 18 |
| TOmitResolve | omit.d.ts | 19 |
| TResolvePropertyKeys | omit.d.ts | 20 |
| TResolveTypeKey | omit.d.ts | 21 |
| TOmit | omit.d.ts | 22 |
| TFromPropertyKey | omit-from-mapped-key.d.ts | 5 |
| TFromPropertyKeys | omit-from-mapped-key.d.ts | 8 |
| TFromMappedKey | omit-from-mapped-key.d.ts | 9 |
| TOmitFromMappedKey | omit-from-mapped-key.d.ts | 10 |
| TFromProperties | pick-from-mapped-result.d.ts | 6 |
| TFromMappedResult | pick-from-mapped-result.d.ts | 9 |
| TPickFromMappedResult | pick-from-mapped-result.d.ts | 10 |
| TFromIntersect | pick.d.ts | 14 |
| TFromUnion | pick.d.ts | 15 |
| TFromProperties | pick.d.ts | 16 |
| TFromObject | pick.d.ts | 17 |
| TUnionFromPropertyKeys | pick.d.ts | 18 |
| TPickResolve | pick.d.ts | 19 |
| TResolvePropertyKeys | pick.d.ts | 20 |
| TResolveTypeKey | pick.d.ts | 21 |
| TPick | pick.d.ts | 22 |
| TFromPropertyKey | pick-from-mapped-key.d.ts | 5 |
| TFromPropertyKeys | pick-from-mapped-key.d.ts | 8 |
| TFromMappedKey | pick-from-mapped-key.d.ts | 9 |
| TPickFromMappedKey | pick-from-mapped-key.d.ts | 10 |
| TNull | null.d.ts | 3 |
| TSymbolValue | symbol.d.ts | 3 |
| TSymbol | symbol.d.ts | 4 |
| TUndefined | undefined.d.ts | 3 |
| TFromComputed | partial.d.ts | 23 |
| TFromRef | partial.d.ts | 24 |
| TFromProperties | partial.d.ts | 25 |
| TFromObject | partial.d.ts | 28 |
| TFromRest | partial.d.ts | 29 |
| TPartial | partial.d.ts | 30 |
| TFromProperties | partial-from-mapped-result.d.ts | 6 |
| TFromMappedResult | partial-from-mapped-result.d.ts | 9 |
| TPartialFromMappedResult | partial-from-mapped-result.d.ts | 10 |
| RegExpOptions | regexp.d.ts | 4 |
| TRegExp | regexp.d.ts | 10 |
| TFromTemplateLiteralKeyInfinite | record.d.ts | 17 |
| TFromTemplateLiteralKeyFinite | record.d.ts | 18 |
| TFromTemplateLiteralKey | record.d.ts | 21 |
| TFromEnumKey | record.d.ts | 22 |
| TFromUnionKeyLiteralString | record.d.ts | 25 |
| TFromUnionKeyLiteralNumber | record.d.ts | 28 |
| TFromUnionKeyVariants | record.d.ts | 31 |
| TFromUnionKey | record.d.ts | 32 |
| TFromLiteralKey | record.d.ts | 33 |
| TFromRegExpKey | record.d.ts | 36 |
| TFromStringKey | record.d.ts | 37 |
| TFromAnyKey | record.d.ts | 38 |
| TFromNeverKey | record.d.ts | 39 |
| TFromBooleanKey | record.d.ts | 40 |
| TFromIntegerKey | record.d.ts | 44 |
| TFromNumberKey | record.d.ts | 45 |
| RecordStatic | record.d.ts | 46 |
| TRecord | record.d.ts | 49 |
| TRecordOrObject | record.d.ts | 58 |
| TRecordKey | record.d.ts | 64 |
| TRecordValue | record.d.ts | 68 |
| TFromComputed | required.d.ts | 23 |
| TFromRef | required.d.ts | 24 |
| TFromProperties | required.d.ts | 25 |
| TFromObject | required.d.ts | 28 |
| TFromRest | required.d.ts | 29 |
| TRequired | required.d.ts | 30 |
| TFromProperties | required-from-mapped-result.d.ts | 6 |
| TFromMappedResult | required-from-mapped-result.d.ts | 9 |
| TRequiredFromMappedResult | required-from-mapped-result.d.ts | 10 |
| TransformDecodeBuilder | transform.d.ts | 4 |
| TransformEncodeBuilder | transform.d.ts | 9 |
| TransformStatic | transform.d.ts | 17 |
| TransformFunction | transform.d.ts | 18 |
| TransformOptions | transform.d.ts | 19 |
| TTransform | transform.d.ts | 23 |
| TDereferenceParameters | compute.d.ts | 27 |
| TDereference | compute.d.ts | 28 |
| TFromAwaited | compute.d.ts | 29 |
| TFromIndex | compute.d.ts | 30 |
| TFromKeyOf | compute.d.ts | 31 |
| TFromPartial | compute.d.ts | 32 |
| TFromOmit | compute.d.ts | 33 |
| TFromPick | compute.d.ts | 34 |
| TFromRequired | compute.d.ts | 35 |
| TFromComputed | compute.d.ts | 36 |
| TFromArray | compute.d.ts | 37 |
| TFromAsyncIterator | compute.d.ts | 38 |
| TFromConstructor | compute.d.ts | 39 |
| TFromFunction | compute.d.ts | 40 |
| TFromIntersect | compute.d.ts | 41 |
| TFromIterator | compute.d.ts | 42 |
| TFromObject | compute.d.ts | 43 |
| TFromRecord | compute.d.ts | 46 |
| TFromTransform | compute.d.ts | 47 |
| TFromTuple | compute.d.ts | 48 |
| TFromUnion | compute.d.ts | 49 |
| TFromTypes | compute.d.ts | 50 |
| TFromType | compute.d.ts | 51 |
| TComputeType | compute.d.ts | 53 |
| TComputeModuleProperties | compute.d.ts | 55 |
| TInferArray | infer.d.ts | 19 |
| TInferAsyncIterator | infer.d.ts | 20 |
| TInferConstructor | infer.d.ts | 21 |
| TInferFunction | infer.d.ts | 22 |
| TInferIterator | infer.d.ts | 23 |
| TInferIntersect | infer.d.ts | 24 |
| ReadonlyOptionalPropertyKeys | infer.d.ts | 25 |
| ReadonlyPropertyKeys | infer.d.ts | 28 |
| OptionalPropertyKeys | infer.d.ts | 31 |
| RequiredPropertyKeys | infer.d.ts | 34 |
| InferPropertiesWithModifiers | infer.d.ts | 35 |
| InferProperties | infer.d.ts | 36 |
| TInferObject | infer.d.ts | 39 |
| TInferTuple | infer.d.ts | 40 |
| TInferRecord | infer.d.ts | 41 |
| TInferRef | infer.d.ts | 44 |
| TInferUnion | infer.d.ts | 45 |
| TInfer | infer.d.ts | 46 |
| TInferFromModuleKey | infer.d.ts | 48 |
| TDefinitions | module.d.ts | 7 |
| TImport | module.d.ts | 13 |
| TModule | module.d.ts | 19 |
| TNot | not.d.ts | 4 |
| TDecodeImport | static.d.ts | 24 |
| TDecodeProperties | static.d.ts | 25 |
| TDecodeTypes | static.d.ts | 28 |
| TDecodeType | static.d.ts | 29 |
| StaticDecodeIsAny | static.d.ts | 30 |
| StaticDecode | static.d.ts | 32 |
| StaticEncode | static.d.ts | 34 |
| Static | static.d.ts | 36 |
| ReadonlyOptionalPropertyKeys | object.d.ts | 7 |
| ReadonlyPropertyKeys | object.d.ts | 10 |
| OptionalPropertyKeys | object.d.ts | 13 |
| RequiredPropertyKeys | object.d.ts | 16 |
| ObjectStaticProperties | object.d.ts | 17 |
| ObjectStatic | object.d.ts | 18 |
| TPropertyKey | object.d.ts | 21 |
| TProperties | object.d.ts | 22 |
| TAdditionalProperties | object.d.ts | 23 |
| ObjectOptions | object.d.ts | 24 |
| TObject | object.d.ts | 32 |
| TupleToIntersect | helpers.d.ts | 4 |
| TupleToUnion | helpers.d.ts | 5 |
| UnionToIntersect | helpers.d.ts | 8 |
| UnionLast | helpers.d.ts | 9 |
| UnionToTuple | helpers.d.ts | 10 |
| Trim | helpers.d.ts | 11 |
| Assert | helpers.d.ts | 12 |
| Evaluate | helpers.d.ts | 13 |
| Ensure | helpers.d.ts | 16 |
| EmptyString | helpers.d.ts | 17 |
| ZeroString | helpers.d.ts | 18 |
| IncrementBase | helpers.d.ts | 19 |
| IncrementTake | helpers.d.ts | 33 |
| IncrementStep | helpers.d.ts | 34 |
| IncrementReverse | helpers.d.ts | 35 |
| TIncrement | helpers.d.ts | 36 |
| AssertProperties | helpers.d.ts | 39 |
| AssertRest | helpers.d.ts | 40 |
| AssertType | helpers.d.ts | 41 |
| ArrayOptions | array.d.ts | 5 |
| ArrayStatic | array.d.ts | 19 |
| TArray | array.d.ts | 20 |
| DateOptions | date.d.ts | 3 |
| TDate | date.d.ts | 15 |
| Uint8ArrayOptions | uint8array.d.ts | 3 |
| TUint8Array | uint8array.d.ts | 7 |
| TUnknown | unknown.d.ts | 3 |
| TVoid | void.d.ts | 3 |
| TKind | schema.d.ts | 20 |
| TArgument | argument.d.ts | 3 |
| TypeGuardUnknownTypeError | type.d.ts | 43 |
| FormatRegistryValidationFunction | format.d.ts | 1 |
| TypeRegistryValidationFunction | type.d.ts | 1 |
| TCompositeKeys | composite.d.ts | 9 |
| TFilterNever | composite.d.ts | 10 |
| TCompositeProperty | composite.d.ts | 11 |
| TCompositeProperties | composite.d.ts | 12 |
| TCompositeEvaluate | composite.d.ts | 15 |
| TComposite | composite.d.ts | 16 |
| TFromArray | const.d.ts | 17 |
| TFromProperties | const.d.ts | 18 |
| TConditionalReadonly | const.d.ts | 21 |
| FromValue | const.d.ts | 22 |
| TConst | const.d.ts | 24 |
| TConstructorParameters | constructor-parameters.d.ts | 5 |
| TExcludeFromTemplateLiteral | exclude-from-template-literal.d.ts | 4 |
| TExcludeRest | exclude.d.ts | 11 |
| TExclude | exclude.d.ts | 14 |
| TFromProperties | exclude-from-mapped-result.d.ts | 5 |
| TFromMappedResult | exclude-from-mapped-result.d.ts | 8 |
| TExcludeFromMappedResult | exclude-from-mapped-result.d.ts | 9 |
| ExtendsResolverError | extends-check.d.ts | 3 |
| ExtendsResult | extends-check.d.ts | 5 |
| TFromProperties | extends-from-mapped-result.d.ts | 5 |
| TFromMappedResult | extends-from-mapped-result.d.ts | 8 |
| TExtendsFromMappedResult | extends-from-mapped-result.d.ts | 9 |
| TExtendsResolve | extends.d.ts | 8 |
| TExtends | extends.d.ts | 9 |
| TFromPropertyKey | extends-from-mapped-key.d.ts | 7 |
| TFromPropertyKeys | extends-from-mapped-key.d.ts | 10 |
| TFromMappedKey | extends-from-mapped-key.d.ts | 11 |
| TExtendsFromMappedKey | extends-from-mapped-key.d.ts | 12 |
| TExtractFromTemplateLiteral | extract-from-template-literal.d.ts | 4 |
| TExtractRest | extract.d.ts | 11 |
| TExtract | extract.d.ts | 14 |
| TFromProperties | extract-from-mapped-result.d.ts | 5 |
| TFromMappedResult | extract-from-mapped-result.d.ts | 8 |
| TExtractFromMappedResult | extract-from-mapped-result.d.ts | 9 |
| TInstanceType | instance-type.d.ts | 4 |
| TFromConstructor | instantiate.d.ts | 18 |
| TFromFunction | instantiate.d.ts | 19 |
| TFromIntersect | instantiate.d.ts | 20 |
| TFromUnion | instantiate.d.ts | 21 |
| TFromTuple | instantiate.d.ts | 22 |
| TFromArray | instantiate.d.ts | 23 |
| TFromAsyncIterator | instantiate.d.ts | 24 |
| TFromIterator | instantiate.d.ts | 25 |
| TFromPromise | instantiate.d.ts | 26 |
| TFromObject | instantiate.d.ts | 27 |
| TFromRecord | instantiate.d.ts | 28 |
| TFromArgument | instantiate.d.ts | 29 |
| TFromProperty | instantiate.d.ts | 30 |
| TFromProperties | instantiate.d.ts | 40 |
| TFromTypes | instantiate.d.ts | 43 |
| TFromType | instantiate.d.ts | 45 |
| TInstantiate | instantiate.d.ts | 47 |
| TMappedIntrinsicPropertyKey | intrinsic-from-mapped-key.d.ts | 7 |
| TMappedIntrinsicPropertyKeys | intrinsic-from-mapped-key.d.ts | 10 |
| TMappedIntrinsicProperties | intrinsic-from-mapped-key.d.ts | 11 |
| TIntrinsicFromMappedKey | intrinsic-from-mapped-key.d.ts | 12 |
| IntrinsicMode | intrinsic.d.ts | 7 |
| TFromTemplateLiteral | intrinsic.d.ts | 8 |
| TFromLiteralValue | intrinsic.d.ts | 9 |
| TFromRest | intrinsic.d.ts | 10 |
| TIntrinsic | intrinsic.d.ts | 11 |
| TCapitalize | capitalize.d.ts | 3 |
| TLowercase | lowercase.d.ts | 3 |
| TUncapitalize | uncapitalize.d.ts | 3 |
| TUppercase | uppercase.d.ts | 3 |
| TParameters | parameters.d.ts | 5 |
| TRestResolve | rest.d.ts | 5 |
| TRest | rest.d.ts | 7 |
| TReturnType | return-type.d.ts | 4 |
| JsonTypeBuilder | json.d.ts | 44 |
| JavaScriptTypeBuilder | javascript.d.ts | 23 |
| FakeTimers | index.d.ts | 71 |
| InitialOptions | index.d.ts | 361 |
| SnapshotFormat | index.d.ts | 386 |
| Colors | index.d.ts | 10 |
| CompareKeys | index.d.ts | 33 |
| Config | index.d.ts | 38 |
| Indent | index.d.ts | 86 |
| NewPlugin | index.d.ts | 88 |
| OldPlugin | index.d.ts | 100 |
| Options | index.d.ts | 111 |
| OptionsReceived | index.d.ts | 117 |
| Plugin_2 | index.d.ts | 119 |
| PluginOptions | index.d.ts | 122 |
| Plugins | index.d.ts | 128 |
| PrettyFormatOptions | index.d.ts | 139 |
| Print | index.d.ts | 145 |
| Printer | index.d.ts | 147 |
| Refs | index.d.ts | 156 |
| RequiredOptions | index.d.ts | 158 |
| Test | index.d.ts | 160 |
| Theme | index.d.ts | 162 |
| Diff | index.d.ts | 17 |
| DiffOptions | index.d.ts | 59 |
| DiffOptionsColor | index.d.ts | 80 |
| DiffOptions | index.d.ts | 19 |
| MatcherHintColor | index.d.ts | 84 |
| MatcherHintOptions | index.d.ts | 86 |
| PrintLabel | index.d.ts | 109 |
| ClassLike | index.d.ts | 10 |
| ConstructorLikeKeys | index.d.ts | 12 |
| FunctionLike | index.d.ts | 20 |
| MethodLikeKeys | index.d.ts | 22 |
| Mock | index.d.ts | 34 |
| Mocked | index.d.ts | 41 |
| MockedClass | index.d.ts | 64 |
| MockedFunction | index.d.ts | 69 |
| MockedFunctionShallow | index.d.ts | 72 |
| MockedObject | index.d.ts | 75 |
| MockedObjectShallow | index.d.ts | 85 |
| MockedShallow | index.d.ts | 93 |
| MockFunctionResult | index.d.ts | 101 |
| MockFunctionResultIncomplete | index.d.ts | 106 |
| MockFunctionResultReturn | index.d.ts | 116 |
| MockFunctionResultThrow | index.d.ts | 126 |
| MockFunctionState | index.d.ts | 134 |
| MockInstance | index.d.ts | 163 |
| MockMetadata | index.d.ts | 187 |
| MockMetadataType | index.d.ts | 199 |
| ModuleMocker | index.d.ts | 209 |
| PropertyLikeKeys | index.d.ts | 301 |
| RejectType | index.d.ts | 306 |
| Replaced | index.d.ts | 309 |
| ResolveType | index.d.ts | 326 |
| Spied | index.d.ts | 329 |
| SpiedClass | index.d.ts | 336 |
| SpiedFunction | index.d.ts | 339 |
| SpiedGetter | index.d.ts | 342 |
| SpiedSetter | index.d.ts | 344 |
| UnknownClass | index.d.ts | 371 |
| UnknownFunction | index.d.ts | 373 |
| AsymmetricMatcher | index.d.ts | 12 |
| AsymmetricMatcher_2 | index.d.ts | 26 |
| AsymmetricMatchers | index.d.ts | 33 |
| AsyncExpectationResult | index.d.ts | 44 |
| BaseExpect | index.d.ts | 46 |
| DeepAsymmetricMatcher | index.d.ts | 66 |
| Expect | index.d.ts | 74 |
| ExpectationResult | index.d.ts | 85 |
| ExpectedAssertionsErrors | index.d.ts | 89 |
| FunctionParameters | index.d.ts | 113 |
| FunctionParametersInternal | index.d.ts | 123 |
| Inverse | index.d.ts | 160 |
| JestAssertionError | index.d.ts | 167 |
| MatcherContext | index.d.ts | 173 |
| MatcherFunction | index.d.ts | 175 |
| MatcherFunctionWithContext | index.d.ts | 178 |
| Matchers | index.d.ts | 188 |
| MatchersObject | index.d.ts | 354 |
| MatcherState | index.d.ts | 358 |
| MatcherUtils | index.d.ts | 375 |
| MockParameters | index.d.ts | 438 |
| PromiseMatchers | index.d.ts | 443 |
| RawMatcherFn | index.d.ts | 456 |
| SyncExpectationResult | index.d.ts | 462 |
| WithAsymmetricMatchers | index.d.ts | 474 |
| ExtractEachCallbackArgs | index.d.ts | 17 |
| FakeableAPI | index.d.ts | 43 |
| FakeTimersConfig | index.d.ts | 60 |
| LegacyFakeTimersConfig | index.d.ts | 103 |
| ImportMeta | index.d.ts | 1687 |
| SymbolConstructor | disposable.d.ts | 5 |
| Disposable | disposable.d.ts | 10 |
| AsyncDisposable | disposable.d.ts | 14 |
| RelativeIndexable | indexable.d.ts | 3 |
| String | indexable.d.ts | 7 |
| Array | indexable.d.ts | 8 |
| ReadonlyArray | indexable.d.ts | 9 |
| Int8Array | indexable.d.ts | 10 |
| Uint8Array | indexable.d.ts | 11 |
| Uint8ClampedArray | indexable.d.ts | 12 |
| Int16Array | indexable.d.ts | 13 |
| Uint16Array | indexable.d.ts | 14 |
| Int32Array | indexable.d.ts | 15 |
| Uint32Array | indexable.d.ts | 16 |
| Float32Array | indexable.d.ts | 17 |
| Float64Array | indexable.d.ts | 18 |
| BigInt64Array | indexable.d.ts | 19 |
| BigUint64Array | indexable.d.ts | 20 |
| IteratorObject | iterators.d.ts | 9 |
| AsyncIteratorObject | iterators.d.ts | 10 |
| IncomingHttpHeaders | header.d.ts | 4 |
| BodyReadable | readable.d.ts | 6 |
| BlobPropertyBag | file.d.ts | 6 |
| FilePropertyBag | file.d.ts | 11 |
| File | file.d.ts | 18 |
| BodyInit | fetch.d.ts | 19 |
| BodyMixin | fetch.d.ts | 30 |
| SpecIterator | fetch.d.ts | 58 |
| SpecIterableIterator | fetch.d.ts | 62 |
| SpecIterable | fetch.d.ts | 66 |
| HeadersInit | fetch.d.ts | 70 |
| Headers | fetch.d.ts | 72 |
| ReferrerPolicy | fetch.d.ts | 138 |
| ClientConnectOptions | client.d.ts | 6 |
| Client | client.d.ts | 11 |
| AbortSignal | dispatcher.d.ts | 10 |
| Dispatcher | dispatcher.d.ts | 15 |
| PoolStats | pool-stats.d.ts | 5 |
| PoolConnectOptions | pool.d.ts | 8 |
| Pool | pool.d.ts | 10 |
| RedirectHandler | handlers.d.ts | 3 |
| DecoratorHandler | handlers.d.ts | 13 |
| BalancedPoolConnectOptions | balanced-pool.d.ts | 7 |
| BalancedPool | balanced-pool.d.ts | 9 |
| Agent | agent.d.ts | 7 |
| MockScope | mock-interceptor.d.ts | 12 |
| MockInterceptor | mock-interceptor.d.ts | 23 |
| Interceptable | mock-interceptor.d.ts | 90 |
| PendingInterceptor | mock-agent.d.ts | 8 |
| MockAgent | mock-agent.d.ts | 13 |
| PendingInterceptorsFormatter | mock-agent.d.ts | 40 |
| MockClient | mock-client.d.ts | 9 |
| MockPool | mock-pool.d.ts | 9 |
| ProxyAgent | proxy-agent.d.ts | 8 |
| EnvHttpProxyAgent | env-http-proxy-agent.d.ts | 6 |
| RetryHandler | retry-handler.d.ts | 5 |
| RetryAgent | retry-agent.d.ts | 6 |
| Cookie | cookies.d.ts | 5 |
| DOMException | patch.d.ts | 5 |
| EventInit | patch.d.ts | 9 |
| EventListenerOptions | patch.d.ts | 15 |
| AddEventListenerOptions | patch.d.ts | 19 |
| EventListenerOrEventListenerObject | patch.d.ts | 25 |
| EventListenerObject | patch.d.ts | 27 |
| EventListener | patch.d.ts | 31 |
| BinaryType | websocket.d.ts | 14 |
| WebSocketEventMap | websocket.d.ts | 16 |
| WebSocket | websocket.d.ts | 23 |
| CloseEventInit | websocket.d.ts | 77 |
| CloseEvent | websocket.d.ts | 83 |
| MessageEventInit | websocket.d.ts | 94 |
| MessageEvent | websocket.d.ts | 102 |
| ErrorEventInit | websocket.d.ts | 125 |
| ErrorEvent | websocket.d.ts | 133 |
| WebSocketInit | websocket.d.ts | 146 |
| EventSourceEventMap | eventsource.d.ts | 10 |
| EventSource | eventsource.d.ts | 16 |
| EventSourceInit | eventsource.d.ts | 58 |
| FileReader | filereader.d.ts | 6 |
| ProgressEventInit | filereader.d.ts | 40 |
| ProgressEvent | filereader.d.ts | 46 |
| MIMEType | content-type.d.ts | 3 |
| CacheStorage | cache.d.ts | 3 |
| Cache | cache.d.ts | 16 |
| CacheQueryOptions | cache.d.ts | 26 |
| MultiCacheQueryOptions | cache.d.ts | 32 |
| _Headers | globals.d.ts | 9 |
| _MessageEvent | globals.d.ts | 10 |
| _EventSource | globals.d.ts | 15 |
| _DOMException | globals.d.ts | 19 |
| NodeDOMException | globals.d.ts | 20 |
| NodeDOMExceptionConstructor | globals.d.ts | 50 |
| _Blob | buffer.d.ts | 3 |
| _File | buffer.d.ts | 4 |
| __Event | dom-events.d.ts | 7 |
| Event | dom-events.d.ts | 8 |
| __CustomEvent | dom-events.d.ts | 29 |
| CustomEvent | dom-events.d.ts | 30 |
| __EventTarget | dom-events.d.ts | 34 |
| EventTarget | dom-events.d.ts | 35 |
| EventInit | dom-events.d.ts | 49 |
| CustomEventInit | dom-events.d.ts | 55 |
| EventListenerOptions | dom-events.d.ts | 59 |
| AddEventListenerOptions | dom-events.d.ts | 63 |
| EventListener | dom-events.d.ts | 69 |
| EventListenerObject | dom-events.d.ts | 73 |
| _ByteLengthQueuingStrategy | web.d.ts | 1 |
| _CompressionStream | web.d.ts | 3 |
| _CountQueuingStrategy | web.d.ts | 5 |
| _DecompressionStream | web.d.ts | 7 |
| _QueuingStrategy | web.d.ts | 9 |
| _ReadableByteStreamController | web.d.ts | 11 |
| _ReadableStream | web.d.ts | 13 |
| _ReadableStreamBYOBReader | web.d.ts | 15 |
| _ReadableStreamDefaultController | web.d.ts | 19 |
| _ReadableStreamDefaultReader | web.d.ts | 21 |
| _TextDecoderStream | web.d.ts | 23 |
| _TextEncoderStream | web.d.ts | 25 |
| _TransformStream | web.d.ts | 27 |
| _TransformStreamDefaultController | web.d.ts | 29 |
| _WritableStream | web.d.ts | 31 |
| _WritableStreamDefaultController | web.d.ts | 33 |
| _WritableStreamDefaultWriter | web.d.ts | 35 |
| NS | html.d.ts | 2 |
| ATTRS | html.d.ts | 10 |
| DOCUMENT_MODE | html.d.ts | 25 |
| TAG_NAMES | html.d.ts | 30 |
| TAG_ID | html.d.ts | 160 |
| TokenType | token.d.ts | 2 |
| Location | token.d.ts | 13 |
| LocationWithAttributes | token.d.ts | 27 |
| ElementLocation | token.d.ts | 31 |
| TokenBase | token.d.ts | 40 |
| DoctypeToken | token.d.ts | 44 |
| Attribute | token.d.ts | 51 |
| TagToken | token.d.ts | 61 |
| CommentToken | token.d.ts | 72 |
| EOFToken | token.d.ts | 76 |
| CharacterToken | token.d.ts | 79 |
| Token | token.d.ts | 83 |
| ParserError | error-codes.d.ts | 2 |
| ParserErrorHandler | error-codes.d.ts | 5 |
| ERR | error-codes.d.ts | 6 |
| Preprocessor | preprocessor.d.ts | 2 |
| BinTrieFlags | decode.d.ts | 1 |
| DecodingMode | decode.d.ts | 6 |
| State | index.d.ts | 5 |
| TokenizerOptions | index.d.ts | 88 |
| TokenHandler | index.d.ts | 91 |
| Tokenizer | index.d.ts | 102 |
| TreeAdapterTypeMap | interface.d.ts | 3 |
| TreeAdapter | interface.d.ts | 22 |
| StackHandler | open-element-stack.d.ts | 3 |
| OpenElementStack | open-element-stack.d.ts | 7 |
| EntryType | formatting-element-list.d.ts | 3 |
| MarkerEntry | formatting-element-list.d.ts | 7 |
| ElementEntry | formatting-element-list.d.ts | 10 |
| Entry | formatting-element-list.d.ts | 15 |
| FormattingElementList | formatting-element-list.d.ts | 16 |
| InsertionMode | index.d.ts | 8 |
| ParserOptions | index.d.ts | 33 |
| Parser | index.d.ts | 65 |
| Document | default.d.ts | 4 |
| DocumentFragment | default.d.ts | 17 |
| Element | default.d.ts | 25 |
| CommentNode | default.d.ts | 41 |
| TextNode | default.d.ts | 51 |
| Template | default.d.ts | 60 |
| DocumentType | default.d.ts | 66 |
| ParentNode | default.d.ts | 80 |
| ChildNode | default.d.ts | 81 |
| Node | default.d.ts | 82 |
| DefaultTreeAdapterMap | default.d.ts | 83 |
| SerializerOptions | index.d.ts | 3 |
| SerializedCookieJar | constants.d.ts | 24 |
| SerializedCookie | constants.d.ts | 50 |
| ParseCookieOptions | cookie.d.ts | 6 |
| CreateCookieOptions | cookie.d.ts | 16 |
| Cookie | cookie.d.ts | 51 |
| Callback | utils.d.ts | 5 |
| ErrorCallback | utils.d.ts | 13 |
| Nullable | utils.d.ts | 20 |
| PromiseCallback | utils.d.ts | 26 |
| Store | store.d.ts | 17 |
| MemoryCookieStoreIndex | memstore.d.ts | 8 |
| MemoryCookieStore | memstore.d.ts | 20 |
| GetPublicSuffixOptions | getPublicSuffix.d.ts | 5 |
| ParameterError | validators.d.ts | 23 |
| SetCookieOptions | cookieJar.d.ts | 9 |
| GetCookiesOptions | cookieJar.d.ts | 61 |
| CreateCookieJarOptions | cookieJar.d.ts | 120 |
| CookieJar | cookieJar.d.ts | 155 |
| FinalizationRegistryConstructor | index.d.ts | 16 |
| WeakRefConstructor | index.d.ts | 18 |
| ValidationResult | index.d.ts | 717 |
| ValidationError | index.d.ts | 722 |
| ReadableOptions | index.d.ts | 13 |
| Options | index.d.ts | 22 |
| AbortSignal | externals.d.ts | 5 |
| Headers | index.d.ts | 94 |
| BlobPart | index.d.ts | 111 |
| BlobOptions | index.d.ts | 113 |
| Blob | index.d.ts | 118 |
| Body | index.d.ts | 127 |
| SystemError | index.d.ts | 141 |
| AbortError | index.d.ts | 145 |
| FetchError | index.d.ts | 151 |
| URLLike | index.d.ts | 191 |
| HeadersInit | index.d.ts | 195 |
| BodyInit | index.d.ts | 196 |
| LocalFile | index.d.ts | 124 |
| Parser | index.d.ts | 132 |
| ParseConfig | index.d.ts | 147 |
| ParseWorkerConfig | index.d.ts | 264 |
| ParseAsyncConfigBase | index.d.ts | 279 |
| ParseLocalConfigBase | index.d.ts | 305 |
| ParseLocalConfigStep | index.d.ts | 310 |
| ParseLocalConfigNoStep | index.d.ts | 314 |
| ParseLocalConfig | index.d.ts | 320 |
| ParseRemoteConfigBase | index.d.ts | 325 |
| ParseRemoteConfigStep | index.d.ts | 349 |
| ParseRemoteConfigNoStep | index.d.ts | 353 |
| ParseRemoteConfig | index.d.ts | 359 |
| UnparseConfig | index.d.ts | 361 |
| UnparseObject | index.d.ts | 422 |
| ParseError | index.d.ts | 428 |
| ParseMeta | index.d.ts | 441 |
| ParseStepResult | index.d.ts | 459 |
| ParseResult | index.d.ts | 478 |
| FormStatusNotPending | index.d.ts | 22 |
| FormStatusPending | index.d.ts | 29 |
| FormStatus | index.d.ts | 36 |
| PreconnectOptions | index.d.ts | 53 |
| PreloadAs | index.d.ts | 63 |
| PreloadOptions | index.d.ts | 76 |
| PreloadModuleAs | index.d.ts | 92 |
| PreloadModuleOptions | index.d.ts | 93 |
| PreinitAs | index.d.ts | 104 |
| PreinitOptions | index.d.ts | 105 |
| PreinitModuleAs | index.d.ts | 116 |
| PreinitModuleOptions | index.d.ts | 117 |
| StackUtils | index.d.ts | 3 |
| Cookie | index.d.ts | 72 |
| CookieJar | index.d.ts | 154 |
| Store | index.d.ts | 271 |
| MemoryCookieStore | index.d.ts | 294 |
| OutputBuffer | index.d.ts | 5 |
| RandomOptions | index.d.ts | 8 |
| RngOptions | index.d.ts | 12 |
| V1BaseOptions | index.d.ts | 17 |
| V1RandomOptions | index.d.ts | 27 |
| V1RngOptions | index.d.ts | 28 |
| V1Options | index.d.ts | 30 |
| V4Options | index.d.ts | 31 |
| v1String | index.d.ts | 33 |
| v1Buffer | index.d.ts | 34 |
| v1 | index.d.ts | 35 |
| v4String | index.d.ts | 37 |
| v4Buffer | index.d.ts | 38 |
| v4 | index.d.ts | 39 |
| v3String | index.d.ts | 41 |
| v3Buffer | index.d.ts | 42 |
| v3Static | index.d.ts | 48 |
| v3 | index.d.ts | 54 |
| v5String | index.d.ts | 56 |
| v5Buffer | index.d.ts | 57 |
| v5Static | index.d.ts | 63 |
| v5 | index.d.ts | 69 |
| NIL | index.d.ts | 71 |
| parse | index.d.ts | 73 |
| stringify | index.d.ts | 74 |
| validate | index.d.ts | 75 |
| version | index.d.ts | 76 |

## Conflicts

### Symbol

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:100
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:83
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2019.symbol.d.ts:19
- /home/israel/personal/code/penguinmails/client/node_modules/@types/d3-shape/index.d.ts:2206

### ObjectConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:155
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:279
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.object.d.ts:19
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2019.object.d.ts:21

### Function

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:275
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:93
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:156
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:1823
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:101

### IArguments

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:404
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:132

### String

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:410
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:4562
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:402
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:270
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:235
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.string.d.ts:19
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2019.string.d.ts:19
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2020.string.d.ts:23
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:7

### StringConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:534
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:544

### Number

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:559
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:4572
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2020.number.d.ts:21

### NumberConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:588
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:213

### ImportMeta

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:631
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:18884
- /home/israel/personal/code/penguinmails/client/node_modules/@types/jest/index.d.ts:1687

### Math

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:660
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:100
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:171

### Date

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:772
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:4581
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.scripthost.d.ts:320
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:112
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2020.date.d.ts:21

### DateConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:925
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.scripthost.d.ts:316
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:89
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.date.d.ts:19

### RegExpMatchArray

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:963
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2018.regexp.d.ts:19

### RegExpExecArray

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:978
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2018.regexp.d.ts:25

### RegExp

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:993
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:369
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:183
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2018.regexp.d.ts:31
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2020.symbol.wellknown.d.ts:34

### RegExpConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1025
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:397
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:231

### JSON

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1155
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:152

### ReadonlyArray

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1191
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:342
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:112
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:102
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2016.array.include.d.ts:28
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2019.array.d.ts:25
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:9

### Array

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1325
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:19
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:76
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:92
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2016.array.include.d.ts:19
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2019.array.d.ts:53
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:8

### ArrayConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1513
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:67
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:96
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:315

### Promise

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1550
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:246
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:175
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2018.promise.d.ts:22

### Omit

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1630
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/util.d.cts:19

### NoInfer

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1680
- /home/israel/personal/code/penguinmails/client/node_modules/@reduxjs/toolkit/dist/index.d.ts:431

### ArrayBuffer

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1702
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:271

### ArrayBufferTypes

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1717
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.sharedmemory.d.ts:42

### ArrayBufferConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1722
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:324
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.arraybuffer.d.ts:19

### DataView

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1746
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:275
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2020.bigint.d.ts:727

### Int8Array

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:1883
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:563
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:275
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:279
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2016.array.include.d.ts:37
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:10

### Int8ArrayConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:2126
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:294
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.typedarrays.d.ts:19

### Uint8Array

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:2165
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:567
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:312
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:283
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2016.array.include.d.ts:46
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:11

### Uint8ArrayConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:2408
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:331
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.typedarrays.d.ts:23

### Uint8ClampedArray

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:2447
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:571
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:349
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:287
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2016.array.include.d.ts:55
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:12

### Uint8ClampedArrayConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:2690
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:368
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.typedarrays.d.ts:27

### Int16Array

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:2729
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:575
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:386
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:291
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2016.array.include.d.ts:64
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:13

### Int16ArrayConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:2971
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:404
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.typedarrays.d.ts:31

### Uint16Array

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:3010
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:579
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:422
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:295
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2016.array.include.d.ts:73
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:14

### Uint16ArrayConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:3253
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:441
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.typedarrays.d.ts:35

### Int32Array

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:3291
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:583
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:459
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:299
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2016.array.include.d.ts:82
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:15

### Int32ArrayConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:3534
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:478
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.typedarrays.d.ts:39

### Uint32Array

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:3573
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:587
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:496
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:303
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2016.array.include.d.ts:91
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:16

### Uint32ArrayConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:3815
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:515
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.typedarrays.d.ts:43

### Float32Array

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:3854
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:591
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:533
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:307
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2016.array.include.d.ts:100
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:17

### Float32ArrayConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:4097
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:552
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.typedarrays.d.ts:47

### Float64Array

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:4136
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.core.d.ts:595
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:570
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:311
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2016.array.include.d.ts:109
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:18

### Float64ArrayConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es5.d.ts:4379
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:589
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.typedarrays.d.ts:51

### AddEventListenerOptions

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:23
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/patch.d.ts:19
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/dom-events.d.ts:63

### BlobPropertyBag

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:294
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/file.d.ts:6

### CacheQueryOptions

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:320
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/cache.d.ts:26

### CloseEventInit

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:366
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/websocket.d.ts:77

### CustomEventInit

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:478
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/dom-events.d.ts:55

### ErrorEventInit

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:653
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/websocket.d.ts:125

### EventInit

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:661
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/patch.d.ts:9
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/dom-events.d.ts:49

### EventListenerOptions

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:667
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/patch.d.ts:15
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/dom-events.d.ts:59

### EventSourceInit

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:688
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/eventsource.d.ts:58

### FilePropertyBag

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:692
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/file.d.ts:11

### MessageEventInit

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:1206
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/websocket.d.ts:94

### MultiCacheQueryOptions

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:1226
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/cache.d.ts:32

### ProgressEventInit

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:1499
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/filereader.d.ts:40

### PropertyDefinition

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:1510
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:327

### RequestInit

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:2039
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:121
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:30

### ResponseInit

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:2073
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:177
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:181

### AbortSignal

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:2746
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/dispatcher.d.ts:10
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/externals.d.ts:5

### AnimationEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:3105
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:11

### AudioParam

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:3817
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:23

### AudioParamMap

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:3897
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:32

### BaseAudioContext

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:4151
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:35

### Blob

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:4391
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:163
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:118

### Body

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:4466
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:127

### CSSKeyframesRule

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:4989
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:50

### CSSNumericArray

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:5324
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:54

### CSSRuleList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:5606
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:61

### CSSStyleDeclaration

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:5764
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:65

### CSSTransformValue

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:7291
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:69

### CSSUnparsedValue

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:7403
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:76

### Cache

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:7460
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:83
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/cache.d.ts:16

### CacheStorage

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:7516
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/cache.d.ts:3

### CanvasPath

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:7674
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:92

### CanvasPathDrawingStyles

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:7697
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:97

### ChildNode

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:7945
- /home/israel/personal/code/penguinmails/client/node_modules/parse5/dist/tree-adapters/default.d.ts:81

### ClipboardEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:8025
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:12

### CloseEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:8082
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/websocket.d.ts:83

### Comment

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:8113
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:360
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:60

### CompositionEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:8126
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:13

### CookieStoreManager

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:8313
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:102

### CustomEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:8543
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/dom-events.d.ts:30

### CustomStateSet

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:8569
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:117

### DOMException

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:8583
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/patch.d.ts:5

### DOMRectList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:9229
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:120

### DOMStringList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:9328
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:124

### DOMTokenList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:9374
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:128

### DataTransfer

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:9444
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:28

### DataTransferItemList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:9554
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:135

### Document

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:9767
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:27
- /home/israel/personal/code/penguinmails/client/node_modules/parse5/dist/tree-adapters/default.d.ts:4

### DocumentFragment

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:10416
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:32
- /home/israel/personal/code/penguinmails/client/node_modules/parse5/dist/tree-adapters/default.d.ts:17

### DocumentType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:10478
- /home/israel/personal/code/penguinmails/client/node_modules/parse5/dist/tree-adapters/default.d.ts:66

### DragEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:10512
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:14

### Element

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:10701
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:31
- /home/israel/personal/code/penguinmails/client/node_modules/parse5/dist/tree-adapters/default.d.ts:25

### ErrorEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:11304
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/websocket.d.ts:133

### Event

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:11347
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:10
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/dom-events.d.ts:8

### EventCounts

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:11480
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:139

### EventListener

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:11489
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/patch.d.ts:31
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/dom-events.d.ts:69

### EventListenerObject

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:11493
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/patch.d.ts:27
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/dom-events.d.ts:73

### EventSourceEventMap

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:11497
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/eventsource.d.ts:10

### EventSource

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:11508
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/eventsource.d.ts:16

### EventTarget

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:11563
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:26
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/dom-events.d.ts:35

### File

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:11608
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/schemas.d.cts:781
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/utils.d.ts:3
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:455
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/file.d.ts:18

### FileList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:11639
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:142
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/utils.d.ts:7

### FileReader

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:11674
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/filereader.d.ts:6

### FileSystemDirectoryHandle

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:11815
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.asynciterable.d.ts:27

### FocusEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:12031
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:15

### FontFaceSet

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:12147
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:146

### FormData

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:12219
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:153
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:155
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/formdata.d.ts:15
- /home/israel/personal/code/penguinmails/client/node_modules/form-data/index.d.ts:30

### HTMLAllCollection

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:12977
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:163

### HTMLAnchorElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13009
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:35

### HTMLAreaElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13091
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:36

### HTMLAudioElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13165
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:37

### HTMLBRElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13182
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:40

### HTMLBaseElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13201
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:38

### HTMLBodyElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13233
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:39

### HTMLButtonElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13262
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:41

### HTMLCanvasElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13381
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:42

### HTMLCollectionBase

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13444
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:167

### HTMLCollectionOf

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13474
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:171

### HTMLDListElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13485
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:48

### HTMLDataElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13504
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:43

### HTMLDataListElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13527
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:44

### HTMLDetailsElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13550
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:45

### HTMLDialogElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13579
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:46

### HTMLDivElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13648
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:47

### HTMLElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13682
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:34

### HTMLEmbedElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13855
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:49

### HTMLFieldSetElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:13906
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:50

### HTMLFormElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:14048
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:175
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:51

### HTMLHRElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:14236
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:54

### HTMLHeadElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:14263
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:53

### HTMLHeadingElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:14280
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:52

### HTMLHtmlElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:14299
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:55

### HTMLIFrameElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:14413
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:56

### HTMLImageElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:14521
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:57

### HTMLInputElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:14702
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:58

### HTMLLIElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:15054
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:62

### HTMLLabelElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:15079
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:60

### HTMLLegendElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:15114
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:61

### HTMLLinkElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:15139
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:63

### HTMLMapElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:15261
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:64

### HTMLMetaElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:15630
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:65

### HTMLMeterElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:15678
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:66

### HTMLModElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:15737
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:59

### HTMLOListElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:15766
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:68

### HTMLObjectElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:15803
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:67

### HTMLOptGroupElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:15937
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:69

### HTMLOptionElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:15966
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:70

### HTMLOutputElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16083
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:71

### HTMLParagraphElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16179
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:72

### HTMLParamElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16199
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:73

### HTMLPreElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16242
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:74

### HTMLProgressElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16261
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:75

### HTMLQuoteElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16302
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:76

### HTMLScriptElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16325
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:78

### HTMLSelectElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16421
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:179
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:79

### HTMLSlotElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16590
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:77

### HTMLSourceElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16631
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:80

### HTMLSpanElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16690
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:81

### HTMLStyleElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16707
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:82

### HTMLTableColElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16875
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:84

### HTMLTableDataCellElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16924
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:85

### HTMLTableElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:16936
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:83

### HTMLTableHeaderCellElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17096
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:86

### HTMLTableRowElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17108
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:87

### HTMLTableSectionElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17190
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:88

### HTMLTemplateElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17253
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:89

### HTMLTextAreaElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17300
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:90

### HTMLTimeElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17498
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:91

### HTMLTitleElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17521
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:92

### HTMLTrackElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17544
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:93

### HTMLUListElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17611
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:94

### HTMLVideoElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17654
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:95

### Headers

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17761
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:187
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:72
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:94

### Highlight

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17811
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:197

### HighlightRegistry

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:17837
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:200

### IDBDatabase

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:18011
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:203

### IDBObjectStore

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:18265
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:212

### ImageTrackList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:18851
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:221

### InputEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:18914
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:16

### KeyboardEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:19076
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:17

### Location

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:19284
- /home/israel/personal/code/penguinmails/client/node_modules/@types/istanbul-lib-coverage/index.d.ts:36
- /home/israel/personal/code/penguinmails/client/node_modules/parse5/dist/common/token.d.ts:13

### MIDIInputMap

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:19516
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:225

### MIDIOutput

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:19551
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:228

### MIDIOutputMap

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:19575
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:237

### MediaKeyStatusMap

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:19989
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:244

### MediaList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:20085
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:251

### MediaSource

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:20400
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:165

### MediaStream

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:20504
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:164

### MessageEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:20770
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:255
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/websocket.d.ts:102

### MimeTypeArray

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:20908
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:260

### MouseEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:20929
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:18

### NamedNodeMap

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:21179
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:264

### Navigator

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:21369
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:268

### Node

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:21658
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:379
- /home/israel/personal/code/penguinmails/client/node_modules/@types/babel__core/index.d.ts:9
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:58
- /home/israel/personal/code/penguinmails/client/node_modules/@types/istanbul-lib-report/index.d.ts:151
- /home/israel/personal/code/penguinmails/client/node_modules/parse5/dist/tree-adapters/default.d.ts:82

### NodeList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:21969
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:284

### NodeListOf

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:21991
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:294

### Notification

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:22033
- /home/israel/personal/code/penguinmails/client/types/notification.ts:2

### ParentNode

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:22666
- /home/israel/personal/code/penguinmails/client/node_modules/parse5/dist/tree-adapters/default.d.ts:80

### Plugin

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:23961
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:304
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/parser/typings/babel-parser.d.ts:99

### PluginArray

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:24004
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:308

### PointerEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:24027
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:20

### ProgressEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:24177
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/filereader.d.ts:46

### RTCRtpTransceiver

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:25395
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:312

### RTCStatsReport

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:25528
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:321

### Range

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:25598
- /home/israel/personal/code/penguinmails/client/node_modules/@types/istanbul-lib-coverage/index.d.ts:41

### ReadableStream

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:25807
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.asynciterable.d.ts:38

### Request

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:26120
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:155
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:8

### Response

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:26316
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:193
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:159

### SVGCircleElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:26903
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:100

### SVGClipPathElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:26938
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:101

### SVGDefsElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27038
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:102

### SVGDescElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27055
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:103

### SVGElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27075
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:98

### SVGEllipseElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27106
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:104

### SVGFEBlendElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27147
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:105

### SVGFEColorMatrixElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27216
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:106

### SVGFEComponentTransferElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27261
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:107

### SVGFECompositeElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27284
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:108

### SVGFEConvolveMatrixElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27357
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:109

### SVGFEDiffuseLightingElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27454
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:110

### SVGFEDisplacementMapElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27501
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:111

### SVGFEDistantLightElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27558
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:112

### SVGFEDropShadowElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27587
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:113

### SVGFEFloodElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27640
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:114

### SVGFEFuncAElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27657
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:115

### SVGFEFuncBElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27674
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:116

### SVGFEFuncGElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27691
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:117

### SVGFEFuncRElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27708
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:118

### SVGFEGaussianBlurElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27725
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:119

### SVGFEImageElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27766
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:120

### SVGFEMergeElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27789
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:121

### SVGFEMergeNodeElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27806
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:122

### SVGFEMorphologyElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27829
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:123

### SVGFEOffsetElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27876
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:124

### SVGFEPointLightElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27911
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:125

### SVGFESpecularLightingElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27946
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:126

### SVGFESpotLightElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:27999
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:127

### SVGFETileElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28064
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:128

### SVGFETurbulenceElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28087
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:129

### SVGFilterElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28152
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:130

### SVGForeignObjectElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28225
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:131

### SVGGElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28266
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:132

### SVGImageElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28414
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:133

### SVGLengthList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28538
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:324

### SVGLineElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28606
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:134

### SVGLinearGradientElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28647
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:135

### SVGMarkerElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28705
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:136

### SVGMaskElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28788
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:137

### SVGMetadataElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28841
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:138

### SVGNumberList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28877
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:328

### SVGPathElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28945
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:139

### SVGPatternElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:28980
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:140

### SVGPointList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29039
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:332

### SVGPolygonElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29107
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:141

### SVGPolylineElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29124
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:142

### SVGRadialGradientElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29194
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:143

### SVGRectElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29247
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:144

### SVGSVGElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29303
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:99

### SVGSetElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29491
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:145

### SVGStopElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29508
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:146

### SVGStringList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29531
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:336

### SVGSwitchElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29636
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:147

### SVGSymbolElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29653
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:148

### SVGTSpanElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29670
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:151

### SVGTextElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29779
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:149

### SVGTextPathElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29796
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:150

### SVGTransformList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:29988
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:340

### SVGUseElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:30092
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:152

### SVGViewElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:30133
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:153

### SourceBufferList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:30929
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:344

### SpeechRecognitionResult

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:30982
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:348

### SpeechRecognitionResultList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:31015
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:352

### StyleMedia

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:31460
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:29

### StylePropertyMapReadOnly

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:31507
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:360

### StyleSheetList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:31601
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:367

### SubtleCrypto

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:31647
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:371

### Text

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:31738
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:156

### TextTrackCueList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:32120
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:402

### TextTrackList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:32152
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:406

### ToggleEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:32219
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:21

### TouchEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:32329
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:19

### TouchList

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:32384
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:410
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:157

### TransitionEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:32491
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:22

### UIEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:32601
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:23

### URLSearchParams

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:32759
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:418

### ViewTransitionTypeSet

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:33386
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:428

### WEBGL_draw_buffers

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:33617
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:431

### WEBGL_multi_draw

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:33685
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:440

### WebGL2RenderingContext

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:33804
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:159

### WebGL2RenderingContextBase

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:34371
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:467

### WebGL2RenderingContextOverloads

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:34819
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:512

### WebGLRenderingContext

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:34993
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:158

### WebGLRenderingContextBase

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:35298
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:537

### WebGLRenderingContextOverloads

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:35878
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.iterable.d.ts:548

### WebSocketEventMap

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:36046
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/websocket.d.ts:16

### WebSocket

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:36058
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/websocket.d.ts:23

### WheelEvent

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:36305
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/global.d.ts:24

### ErrorCallback

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:37985
- /home/israel/personal/code/penguinmails/client/node_modules/tough-cookie/dist/utils.d.ts:13

### BlobPart

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39166
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:111

### BodyInit

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39167
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:19
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:196

### EventListenerOrEventListenerObject

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39184
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/patch.d.ts:25

### FormDataEntryValue

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39187
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/formdata.d.ts:10

### HeadersInit

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39203
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:70
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:195

### RequestInfo

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39228
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:12
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:203

### BinaryType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39256
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/websocket.d.ts:14

### ReferrerPolicy

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39389
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:138

### RequestCache

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39391
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:91
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:86

### RequestCredentials

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39392
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:99
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:84

### RequestDestination

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39393
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:101

### RequestMode

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39394
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:149
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:82

### RequestRedirect

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39396
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:151
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:83

### ResponseType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.dom.d.ts:39400
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/fetch.d.ts:183
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node-fetch/index.d.ts:173

### Map

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.collection.d.ts:19
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:141
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:136

### MapConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.collection.d.ts:48
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:181
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:318

### ReadonlyMap

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.collection.d.ts:55
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:161

### WeakMap

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.collection.d.ts:62
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:186
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:140

### WeakMapConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.collection.d.ts:83
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:188

### Set

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.collection.d.ts:89
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:196
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:144

### SetConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.collection.d.ts:115
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:236
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:321

### ReadonlySet

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.collection.d.ts:121
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:216

### WeakSet

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.collection.d.ts:127
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:240
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:148

### WeakSetConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.collection.d.ts:143
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:242

### GeneratorFunction

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.generator.d.ts:29
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:167

### SymbolConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:21
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.d.ts:19
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:21
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2018.asynciterable.d.ts:22
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2020.symbol.wellknown.d.ts:22
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.esnext.disposable.d.ts:23
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/disposable.d.ts:5

### IteratorObject

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:62
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.esnext.disposable.d.ts:189
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/iterators.d.ts:9

### PromiseConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.iterable.d.ts:248
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.promise.d.ts:19
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:179
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2020.promise.d.ts:31

### Atomics

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2017.sharedmemory.d.ts:46
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2020.sharedmemory.d.ts:21

### AsyncIteratorObject

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2018.asynciterable.d.ts:51
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.esnext.disposable.d.ts:192
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/iterators.d.ts:10

### BigInt64Array

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2020.bigint.d.ts:149
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:19

### BigUint64Array

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.es2020.bigint.d.ts:440
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/indexable.d.ts:20

### Disposable

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.esnext.disposable.d.ts:35
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/disposable.d.ts:10

### AsyncDisposable

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/typescript/lib/lib.esnext.disposable.d.ts:39
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/compatibility/disposable.d.ts:14

### CompanyInfo

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/company.ts:36
- /home/israel/personal/code/penguinmails/client/types/settings/base.ts:19

### IsAny

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/util.d.cts:18
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/utils.d.ts:39
- /home/israel/personal/code/penguinmails/client/node_modules/@reduxjs/toolkit/dist/index.d.ts:375

### InexactPartial

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/util.d.cts:35
- /home/israel/personal/code/penguinmails/client/node_modules/@types/react/index.d.ts:4251

### EmptyObject

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/util.d.cts:38
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/utils.d.ts:14

### AnyFunc

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/util.d.cts:66
- /home/israel/personal/code/penguinmails/client/node_modules/immer/dist/immer.d.ts:15

### OmitIndexSignature

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/util.d.cts:70
- /home/israel/personal/code/penguinmails/client/node_modules/reselect/dist/reselect.d.ts:632

### Keys

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/util.d.cts:76
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/path/common.d.ts:268

### Literal

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/util.d.cts:87
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:1831
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:432

### Primitive

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/util.d.cts:89
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/utils.d.ts:12
- /home/israel/personal/code/penguinmails/client/node_modules/@types/d3-array/index.d.ts:10

### Numeric

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/util.d.cts:97
- /home/israel/personal/code/penguinmails/client/node_modules/decimal.js-light/decimal.d.ts:570
- /home/israel/personal/code/penguinmails/client/node_modules/@types/d3-array/index.d.ts:15

### Class

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/util.d.cts:195
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:1839
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:580

### _File

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/schemas.d.cts:777
- /home/israel/personal/code/penguinmails/client/node_modules/@types/node/buffer.d.ts:4

### RawIssue

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/errors.d.cts:107
- /home/israel/personal/code/penguinmails/client/node_modules/zod/v4/core/api.d.cts:269

### Template

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/templates.ts:1
- /home/israel/personal/code/penguinmails/client/node_modules/parse5/dist/tree-adapters/default.d.ts:60

### TemplateFormValues

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/templates.ts:93
- /home/israel/personal/code/penguinmails/client/types/forms.ts:238

### CampaignStatus

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/campaign.ts:1
- /home/israel/personal/code/penguinmails/client/types/analytics/domain-specific.ts:132

### Campaign

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/campaign.ts:47
- /home/israel/personal/code/penguinmails/client/types/inbox.ts:79

### ChartData

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/campaign.ts:78
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/state/chartDataSlice.d.ts:9

### CampaignFormValues

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/campaign.ts:191
- /home/israel/personal/code/penguinmails/client/types/campaigns.ts:11
- /home/israel/personal/code/penguinmails/client/types/forms.ts:237

### CampaignFormProps

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/campaign.ts:193
- /home/israel/personal/code/penguinmails/client/types/campaigns.ts:13

### CampaignSteps

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/campaign.ts:202
- /home/israel/personal/code/penguinmails/client/types/campaigns.ts:22

### PartialCampaignStep

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/campaign.ts:204
- /home/israel/personal/code/penguinmails/client/types/campaigns.ts:24

### SequenceStepActionsProps

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/campaign.ts:207
- /home/israel/personal/code/penguinmails/client/types/campaigns.ts:27

### SequenceStepProps

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/campaign.ts:220
- /home/israel/personal/code/penguinmails/client/types/campaigns.ts:51

### DNSRecordType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:4
- /home/israel/personal/code/penguinmails/client/types/domain.ts:4

### DNSRecordStatus

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:16
- /home/israel/personal/code/penguinmails/client/types/domain.ts:16

### DomainStatus

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:19
- /home/israel/personal/code/penguinmails/client/types/domain.ts:28

### EmailAccountStatus

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:27
- /home/israel/personal/code/penguinmails/client/types/domain.ts:36

### VerificationStatus

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:35
- /home/israel/personal/code/penguinmails/client/types/domain.ts:44

### RelayType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:44
- /home/israel/personal/code/penguinmails/client/types/domain.ts:62

### DomainAccountCreationType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:51
- /home/israel/personal/code/penguinmails/client/types/domain.ts:69

### WarmupStatusType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:56
- /home/israel/personal/code/penguinmails/client/types/domain.ts:75

### DNSProvider

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:59
- /home/israel/personal/code/penguinmails/client/types/domain.ts:78

### DNSRecord

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:92
- /home/israel/personal/code/penguinmails/client/types/domain.ts:18

### Domain

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:102
- /home/israel/personal/code/penguinmails/client/types/domain.ts:91

### DomainAnalytics

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:180
- /home/israel/personal/code/penguinmails/client/types/analytics/domain-specific.ts:30

### EmailAccount

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:198
- /home/israel/personal/code/penguinmails/client/types/accounts.ts:1
- /home/israel/personal/code/penguinmails/client/types/domain.ts:123

### AddDomainFormType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:263
- /home/israel/personal/code/penguinmails/client/types/domain.ts:231

### DomainSettingsFormType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:278
- /home/israel/personal/code/penguinmails/client/types/domain.ts:246

### SPFConfig

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:281
- /home/israel/personal/code/penguinmails/client/types/domain.ts:143

### DKIMConfig

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:287
- /home/israel/personal/code/penguinmails/client/types/domain.ts:149

### DMARCConfig

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:293
- /home/israel/personal/code/penguinmails/client/types/domain.ts:155

### DomainAuthentication

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:301
- /home/israel/personal/code/penguinmails/client/types/domain.ts:163

### WarmupConfig

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:307
- /home/israel/personal/code/penguinmails/client/types/domain.ts:170

### ReputationFactors

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:318
- /home/israel/personal/code/penguinmails/client/types/domain.ts:182

### DomainSettings

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/domains.ts:332
- /home/israel/personal/code/penguinmails/client/types/domain.ts:189

### WarmupStatus

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/mailbox.ts:69
- /home/israel/personal/code/penguinmails/client/types/analytics/domain-specific.ts:134

### AccountDetails

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/mailbox.ts:96
- /home/israel/personal/code/penguinmails/client/types/accounts.ts:41

### Client

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/clients-leads.ts:18
- /home/israel/personal/code/penguinmails/client/types/inbox.ts:80
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/client.d.ts:11

### LeadStatus

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/clients-leads.ts:29
- /home/israel/personal/code/penguinmails/client/types/analytics/domain-specific.ts:136

### Email

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/conversation.ts:11
- /home/israel/personal/code/penguinmails/client/types/inbox.ts:78

### Message

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/conversation.ts:33
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/errors.d.ts:4

### AlertType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/notification.ts:66
- /home/israel/personal/code/penguinmails/client/types/analytics/billing.ts:124

### NotificationPreferences

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/notification.ts:141
- /home/israel/personal/code/penguinmails/client/types/settings/notifications.ts:22

### Config

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/class-variance-authority/dist/index.d.ts:29
- /home/israel/personal/code/penguinmails/client/node_modules/decimal.js-light/decimal.d.ts:562
- /home/israel/personal/code/penguinmails/client/node_modules/pretty-format/build/index.d.ts:38

### Props

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/class-variance-authority/dist/index.d.ts:34
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/container/Surface.d.ts:21
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/container/Layer.d.ts:7
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/shape/Dot.d.ts:13
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/DefaultTooltipContent.d.ts:29
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/CartesianAxis.d.ts:54
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/shape/Rectangle.d.ts:21
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/Label.d.ts:24
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/shape/Curve.d.ts:35
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/Area.d.ts:44
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/Bar.d.ts:64
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/Line.d.ts:49
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/LabelList.d.ts:23
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/Scatter.d.ts:56
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/ErrorBar.d.ts:44
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/CartesianGrid.d.ts:106
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/DefaultLegendContent.d.ts:47
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/Legend.d.ts:8
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/ResponsiveContainer.d.ts:3
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/Cell.d.ts:5
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/Text.d.ts:15
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/Customized.d.ts:7
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/shape/Sector.d.ts:11
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/shape/Polygon.d.ts:13
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/shape/Cross.d.ts:15
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/polar/PolarGrid.d.ts:16
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/polar/PolarRadiusAxis.d.ts:15
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/polar/PolarAngleAxis.d.ts:34
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/polar/Pie.d.ts:87
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/polar/Radar.d.ts:53
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/Brush.d.ts:29
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/XAxis.d.ts:28
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/YAxis.d.ts:28
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/ReferenceLine.d.ts:41
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/ReferenceDot.d.ts:22
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/ReferenceArea.d.ts:18
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/ZAxis.d.ts:6
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/chart/Treemap.d.ts:38
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/chart/Sankey.d.ts:63
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/shape/Trapezoid.d.ts:19
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/Funnel.d.ts:62

### Observer

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/utils/createSubject.d.ts:2
- /home/israel/personal/code/penguinmails/client/node_modules/redux/dist/redux.d.ts:196

### EventType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/events.d.ts:1
- /home/israel/personal/code/penguinmails/client/types/toolbar.ts:24

### UnionToIntersection

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/path/common.d.ts:60
- /home/israel/personal/code/penguinmails/client/node_modules/reselect/dist/reselect.d.ts:642
- /home/israel/personal/code/penguinmails/client/node_modules/@reduxjs/toolkit/dist/index.d.ts:413

### Path

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/path/eager.d.ts:37
- /home/israel/personal/code/penguinmails/client/node_modules/@types/d3-path/index.d.ts:6

### Noop

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/utils.d.ts:2
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:1388

### NonUndefined

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/utils.d.ts:17
- /home/israel/personal/code/penguinmails/client/node_modules/@reduxjs/toolkit/dist/index.d.ts:432

### DeepPartial

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/react-hook-form/dist/types/utils.d.ts:22
- /home/israel/personal/code/penguinmails/client/types/settings/base.ts:87

### SymbolType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@types/d3-shape/index.d.ts:2186
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/util/types.d.ts:33

### TooltipType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/DefaultTooltipContent.d.ts:7
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/util/types.d.ts:35

### Formatter

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/DefaultTooltipContent.d.ts:10
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/DefaultLegendContent.d.ts:11

### Store

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/redux/dist/redux.d.ts:208
- /home/israel/personal/code/penguinmails/client/node_modules/tough-cookie/dist/store.d.ts:17
- /home/israel/personal/code/penguinmails/client/node_modules/@types/tough-cookie/index.d.ts:271

### UnknownIfNonSpecific

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/redux/dist/redux.d.ts:285
- /home/israel/personal/code/penguinmails/client/node_modules/@reduxjs/toolkit/dist/index.d.ts:449

### Immutable

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/immer/dist/immer.d.ts:38
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:1832

### Intersect

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/reselect/dist/reselect.d.ts:48
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/intersect/intersect.d.ts:4

### AnyFunction

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/reselect/dist/reselect.d.ts:529
- /home/israel/personal/code/penguinmails/client/node_modules/@reduxjs/toolkit/dist/index.d.ts:1802

### UnknownFunction

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/reselect/dist/reselect.d.ts:535
- /home/israel/personal/code/penguinmails/client/node_modules/jest-mock/build/index.d.ts:373

### FallbackIfUnknown

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/reselect/dist/reselect.d.ts:695
- /home/israel/personal/code/penguinmails/client/node_modules/@reduxjs/toolkit/dist/index.d.ts:384

### IfMaybeUndefined

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@reduxjs/toolkit/dist/uncheckedindexed.ts:3
- /home/israel/personal/code/penguinmails/client/node_modules/@reduxjs/toolkit/dist/index.d.ts:388

### ContentType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/Label.d.ts:4
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/DefaultLegendContent.d.ts:7
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/Tooltip.d.ts:10

### InternalProps

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/DefaultLegendContent.d.ts:29
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/cartesian/Funnel.d.ts:61

### State

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/component/Legend.d.ts:23
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/chart/Sankey.d.ts:65
- /home/israel/personal/code/penguinmails/client/node_modules/parse5/dist/tokenizer/index.d.ts:5

### AxisSvgProps

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/polar/PolarRadiusAxis.d.ts:14
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/polar/PolarAngleAxis.d.ts:33

### TextOptions

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/recharts/types/chart/SunburstChart.d.ts:12
- /home/israel/personal/code/penguinmails/client/node_modules/@types/istanbul-reports/index.d.ts:55

### AnalyticsFilters

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/analytics/core.ts:83
- /home/israel/personal/code/penguinmails/client/types/analytics.ts:483

### DataGranularity

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/analytics/core.ts:107
- /home/israel/personal/code/penguinmails/client/types/analytics.ts:71

### BillingAnalytics

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/analytics/domain-specific.ts:106
- /home/israel/personal/code/penguinmails/client/types/analytics/billing.ts:11

### DailyWarmupStats

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/analytics/domain-specific.ts:174
- /home/israel/personal/code/penguinmails/client/types/analytics.ts:279

### DateRangePreset

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/analytics/ui.ts:10
- /home/israel/personal/code/penguinmails/client/types/analytics.ts:76

### ChartDataPoint

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/analytics/ui.ts:103
- /home/israel/personal/code/penguinmails/client/types/analytics.ts:113

### MetricToggleProps

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/analytics/ui.ts:163
- /home/israel/personal/code/penguinmails/client/types/analytics.ts:560

### EntityFilterProps

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/analytics/ui.ts:200
- /home/israel/personal/code/penguinmails/client/types/analytics.ts:597

### TeamMember

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/team.ts:27
- /home/israel/personal/code/penguinmails/client/types/settings/team.ts:9

### TeamMembersResponse

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/team.ts:161
- /home/israel/personal/code/penguinmails/client/types/settings/team.ts:37

### BaseEntity

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/common.ts:16
- /home/israel/personal/code/penguinmails/client/types/settings/base.ts:9

### ActionResult

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/common.ts:61
- /home/israel/personal/code/penguinmails/client/types/settings/base.ts:16

### BillingAddress

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/settings/base.ts:28
- /home/israel/personal/code/penguinmails/client/types/billing.ts:99

### SubscriptionPlan

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/settings/billing.ts:12
- /home/israel/personal/code/penguinmails/client/types/billing.ts:172

### PaymentMethod

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/settings/billing.ts:28
- /home/israel/personal/code/penguinmails/client/types/billing.ts:108

### UsageMetrics

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/settings/billing.ts:40
- /home/israel/personal/code/penguinmails/client/types/analytics/billing.ts:49

### PluginItem

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/types/toolbar.ts:30
- /home/israel/personal/code/penguinmails/client/node_modules/@types/babel__core/index.d.ts:681

### Position

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:349
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:71

### SourceLocation

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:361
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:65

### BaseNode

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:367
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:28

### ArrayExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:380
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:302

### AssignmentExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:384
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:360

### BinaryExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:390
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:353

### Directive

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:400
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:85

### BlockStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:408
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:131

### BreakStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:413
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:159

### CallExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:417
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:392

### CatchClause

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:425
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:421

### ConditionalExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:430
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:381

### ContinueStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:436
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:164

### DebuggerStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:440
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:228

### DoWhileStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:443
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:204

### EmptyStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:448
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:127

### ExpressionStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:451
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:141

### ForInStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:461
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:224

### ForStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:467
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:210

### FunctionDeclaration

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:474
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:243

### FunctionExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:486
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:335

### Identifier

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:497
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:427

### IfStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:504
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:146

### LabeledStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:510
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:153

### RegExpLiteral

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:537
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:440

### LogicalExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:550
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:374

### MemberExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:556
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:403

### NewExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:563
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:399

### Program

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:571
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:78

### ObjectExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:578
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:307

### RestElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:603
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:569

### ReturnStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:620
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:181

### SequenceExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:624
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:341

### SwitchCase

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:632
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:415

### SwitchStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:637
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:175

### ThisExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:642
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:298

### ThrowStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:645
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:186

### TryStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:649
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:191

### UnaryExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:655
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:346

### UpdateExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:661
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:367

### VariableDeclaration

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:667
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:247

### VariableDeclarator

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:673
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:253

### WhileStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:679
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:198

### WithStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:684
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:169

### AssignmentPattern

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:689
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:574

### ArrayPattern

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:697
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:564

### ArrowFunctionExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:704
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:519

### ClassBody

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:715
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:586

### ClassExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:719
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:610

### ClassDeclaration

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:730
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:606

### ExportAllDeclaration

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:743
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:684

### ExportDefaultDeclaration

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:751
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:679

### ExportNamedDeclaration

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:756
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:665

### ExportSpecifier

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:766
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:673

### ForOfStatement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:772
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:505

### ImportDeclaration

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:779
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:633

### ImportDefaultSpecifier

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:790
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:657

### ImportNamespaceSpecifier

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:794
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:661

### ImportSpecifier

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:798
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:640

### ImportExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:804
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:651

### MetaProperty

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:810
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:615

### ObjectPattern

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:834
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:559

### SpreadElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:841
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:514

### Super

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:852
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:510

### TaggedTemplateExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:855
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:537

### TemplateElement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:861
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:543

### TemplateLiteral

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:869
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:531

### YieldExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:874
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:525

### AwaitExpression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:879
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:691

### BigIntLiteral

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:886
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:450

### StaticBlock

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:978
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:137

### ImportAttribute

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:982
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:645

### Expression

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:1809
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:287
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/template-literal/parse.d.ts:4

### Statement

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:1814
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:103

### Declaration

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:1826
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:232

### Property

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:1836
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:317

### Pattern

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:1838
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:411

### ModuleSpecifier

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:1842
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:628

### ModuleDeclaration

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:1858
- /home/israel/personal/code/penguinmails/client/node_modules/@types/estree/index.d.ts:621

### Options

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/types/lib/index.d.ts:2789
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/parser/typings/babel-parser.d.ts:102
- /home/israel/personal/code/penguinmails/client/node_modules/pretty-format/build/index.d.ts:111
- /home/israel/personal/code/penguinmails/client/node_modules/form-data/index.d.ts:22

### ParserOptions

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/parser/typings/babel-parser.d.ts:220
- /home/israel/personal/code/penguinmails/client/node_modules/parse5/dist/parser/index.d.ts:33

### ParseError

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/parser/typings/babel-parser.d.ts:221
- /home/israel/personal/code/penguinmails/client/node_modules/@types/papaparse/index.d.ts:428

### ParseResult

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@babel/parser/typings/babel-parser.d.ts:225
- /home/israel/personal/code/penguinmails/client/node_modules/@types/babel__core/index.d.ts:10
- /home/israel/personal/code/penguinmails/client/node_modules/@types/papaparse/index.d.ts:478

### Visitor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@types/babel__traverse/index.d.ts:299
- /home/israel/personal/code/penguinmails/client/node_modules/@types/istanbul-lib-report/index.d.ts:173

### TransformOptions

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@types/babel__core/index.d.ts:29
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/transform/transform.d.ts:19

### PluginOptions

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@types/babel__core/index.d.ts:677
- /home/israel/personal/code/penguinmails/client/node_modules/pretty-format/build/index.d.ts:122

### Color

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@types/d3-color/index.d.ts:59
- /home/israel/personal/code/penguinmails/client/node_modules/chalk/index.d.ts:56

### TFromProperties

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/readonly/readonly-from-mapped-result.d.ts:4
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/indexed/indexed-from-mapped-result.d.ts:6
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/optional/optional-from-mapped-result.d.ts:4
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/keyof/keyof-property-keys.d.ts:17
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/keyof/keyof-from-mapped-result.d.ts:6
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/omit/omit-from-mapped-result.d.ts:6
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/omit/omit.d.ts:16
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/pick/pick-from-mapped-result.d.ts:6
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/pick/pick.d.ts:16
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/partial/partial.d.ts:25
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/partial/partial-from-mapped-result.d.ts:6
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/required/required.d.ts:25
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/required/required-from-mapped-result.d.ts:6
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/const/const.d.ts:18
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/exclude/exclude-from-mapped-result.d.ts:5
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/extends/extends-from-mapped-result.d.ts:5
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/extract/extract-from-mapped-result.d.ts:5
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:40

### TFromMappedResult

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/readonly/readonly-from-mapped-result.d.ts:7
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/indexed/indexed-from-mapped-result.d.ts:9
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/mapped/mapped.d.ts:21
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/optional/optional-from-mapped-result.d.ts:7
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/keyof/keyof-from-mapped-result.d.ts:9
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/omit/omit-from-mapped-result.d.ts:9
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/pick/pick-from-mapped-result.d.ts:9
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/partial/partial-from-mapped-result.d.ts:9
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/required/required-from-mapped-result.d.ts:9
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/exclude/exclude-from-mapped-result.d.ts:8
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/extends/extends-from-mapped-result.d.ts:8
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/extract/extract-from-mapped-result.d.ts:8

### StaticReturnType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/constructor/constructor.d.ts:8
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/function/function.d.ts:8

### StaticParameter

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/constructor/constructor.d.ts:9
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/function/function.d.ts:9

### StaticParameters

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/constructor/constructor.d.ts:12
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/function/function.d.ts:12

### TRemoveOptionalFromType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/intersect/intersect-evaluated.d.ts:7
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/union/union-evaluated.d.ts:8

### TRemoveOptionalFromRest

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/intersect/intersect-evaluated.d.ts:8
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/union/union-evaluated.d.ts:7

### TFromTemplateLiteralKinds

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/template-literal/finite.d.ts:14
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/template-literal/generate.d.ts:16

### TFromTemplateLiteral

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/indexed/indexed-property-keys.d.ts:7
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/intrinsic/intrinsic.d.ts:8

### TFromUnion

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/indexed/indexed-property-keys.d.ts:8
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/indexed/indexed.d.ts:22
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/keyof/keyof-property-keys.d.ts:12
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/omit/omit.d.ts:15
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/pick/pick.d.ts:15
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:49
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:21

### TFromRest

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/indexed/indexed.d.ts:18
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/mapped/mapped.d.ts:30
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/awaited/awaited.d.ts:10
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/keyof/keyof-property-keys.d.ts:10
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/partial/partial.d.ts:29
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/required/required.d.ts:29
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/intrinsic/intrinsic.d.ts:10

### TFromIntersect

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/indexed/indexed.d.ts:20
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/keyof/keyof-property-keys.d.ts:11
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/omit/omit.d.ts:14
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/pick/pick.d.ts:14
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:41
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:20

### TFromTuple

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/indexed/indexed.d.ts:23
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/keyof/keyof-property-keys.d.ts:13
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:48
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:22

### TFromArray

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/indexed/indexed.d.ts:24
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/keyof/keyof-property-keys.d.ts:14
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:37
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/const/const.d.ts:17
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:23

### TFromProperty

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/indexed/indexed.d.ts:26
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:30

### TFromMappedKey

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/mapped/mapped.d.ts:29
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/omit/omit-from-mapped-key.d.ts:9
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/pick/pick-from-mapped-key.d.ts:9
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/extends/extends-from-mapped-key.d.ts:11

### TFromComputed

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/awaited/awaited.d.ts:8
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/keyof/keyof.d.ts:12
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/partial/partial.d.ts:23
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/required/required.d.ts:23
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:36

### TFromRef

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/awaited/awaited.d.ts:9
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/keyof/keyof.d.ts:13
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/partial/partial.d.ts:24
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/required/required.d.ts:24

### TFromObject

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/omit/omit.d.ts:17
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/pick/pick.d.ts:17
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/partial/partial.d.ts:28
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/required/required.d.ts:28
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:43
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:27

### TUnionFromPropertyKeys

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/omit/omit.d.ts:18
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/pick/pick.d.ts:18

### TResolvePropertyKeys

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/omit/omit.d.ts:20
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/pick/pick.d.ts:20

### TResolveTypeKey

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/omit/omit.d.ts:21
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/pick/pick.d.ts:21

### TFromPropertyKey

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/omit/omit-from-mapped-key.d.ts:5
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/pick/pick-from-mapped-key.d.ts:5
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/extends/extends-from-mapped-key.d.ts:7

### TFromPropertyKeys

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/omit/omit-from-mapped-key.d.ts:8
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/pick/pick-from-mapped-key.d.ts:8
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/extends/extends-from-mapped-key.d.ts:10

### TFromAsyncIterator

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:38
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:24

### TFromConstructor

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:39
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:18

### TFromFunction

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:40
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:19

### TFromIterator

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:42
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:25

### TFromRecord

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:46
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:28

### TFromTypes

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:50
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:43

### TFromType

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/compute.d.ts:51
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/instantiate/instantiate.d.ts:45

### ReadonlyOptionalPropertyKeys

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/infer.d.ts:25
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/object/object.d.ts:7

### ReadonlyPropertyKeys

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/infer.d.ts:28
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/object/object.d.ts:10

### OptionalPropertyKeys

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/infer.d.ts:31
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/object/object.d.ts:13

### RequiredPropertyKeys

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/module/infer.d.ts:34
- /home/israel/personal/code/penguinmails/client/node_modules/@sinclair/typebox/build/cjs/type/object/object.d.ts:16

### DiffOptions

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/jest-diff/build/index.d.ts:59
- /home/israel/personal/code/penguinmails/client/node_modules/jest-matcher-utils/build/index.d.ts:19

### Cookie

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/undici-types/cookies.d.ts:5
- /home/israel/personal/code/penguinmails/client/node_modules/tough-cookie/dist/cookie/cookie.d.ts:51
- /home/israel/personal/code/penguinmails/client/node_modules/@types/tough-cookie/index.d.ts:72

### Parser

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/parse5/dist/parser/index.d.ts:65
- /home/israel/personal/code/penguinmails/client/node_modules/@types/papaparse/index.d.ts:132

### MemoryCookieStore

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/tough-cookie/dist/memstore.d.ts:20
- /home/israel/personal/code/penguinmails/client/node_modules/@types/tough-cookie/index.d.ts:294

### CookieJar

- **Type**: naming-conflict
- **Resolution**: consolidate-with-renaming
- **Breaking Changes**: No
- **Description**: Type name used in multiple contexts, may benefit from consolidation

**Locations**:
- /home/israel/personal/code/penguinmails/client/node_modules/tough-cookie/dist/cookie/cookieJar.d.ts:155
- /home/israel/personal/code/penguinmails/client/node_modules/@types/tough-cookie/index.d.ts:154

## Recommendations

- 560 naming conflicts identified. Review and potentially rename for clarity.
- Review breaking changes before implementing consolidation recommendations.

