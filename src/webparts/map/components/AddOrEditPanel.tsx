
import * as React from 'react';
import { IMarker, IMarkerCategory, MarkerType } from './IMapProps';
import styles from './Map.module.scss';
import { clone } from '@microsoft/sp-lodash-subset';
import { Icon, Panel, Dialog, TextField, IPanelProps, PrimaryButton, DefaultButton, IChoiceGroupOption, ChoiceGroup, IDropdownOption, Dropdown, getColorFromString, IColor, PanelType, Label } from 'office-ui-fabric-react';
import { Guid } from '@microsoft/sp-core-library';
import { isNullOrEmpty, isFunction } from '@spfxappdev/utility';
import { InlineColorPicker, IInlineColorPickerProps } from '@src/components/inlineColorPicker/InlineColorPicker';
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import '@spfxappdev/utility/lib/extensions/StringExtensions';
import '@spfxappdev/utility/lib/extensions/ArrayExtensions';
import ManageMarkerCategoriesDialog from './ManageMarkerCategoriesDialog';
import { MarkerIcon } from './MarkerIcon';

export interface IAddOrEditPanelProps {
    markerItem: IMarker;
    markerCategories: IMarkerCategory[];
    onDismiss();
    onMarkerChanged(markerItem: IMarker, isNewMarker: boolean);
    onMarkerCategoriesChanged(markerCategories: IMarkerCategory[]);
}

interface IAddOrEditPanelState {
    markerItem: IMarker;
    markerCategories: IMarkerCategory[];
    isSaveButtonDisabled: boolean;
    isManageCategoriesDialogVisible: boolean;
}

export default class AddOrEditPanel extends React.Component<IAddOrEditPanelProps, IAddOrEditPanelState> {

    public state: IAddOrEditPanelState = {
        markerItem: clone(this.props.markerItem),
        markerCategories: clone(this.props.markerCategories),
        isSaveButtonDisabled: true,
        isManageCategoriesDialogVisible: false
    };

    private readonly isNewMarker: boolean;

    private readonly headerText: string;
    
    private markerTypeOptions: IChoiceGroupOption[] = [
        { key: 'Panel', text: 'Panel', iconProps: { iconName: 'SidePanel' } },
        { key: 'Dialog', text: 'Dialog', iconProps: { iconName: 'Favicon' } },
        { key: 'Url', text: 'Url', iconProps: { iconName: 'Link' } },
        { key: 'None', text: 'None (not clickable)', iconProps: { iconName: 'FieldEmpty' } },
    ];

    private urlOptions: IChoiceGroupOption[] = [
        { key: '_self', text: 'Open in same window' },
        { key: '_blank', text: 'Open in new window' },
        { key: 'embedded', text: 'Embedded (Dialog/iFrame)' },
      ];

    constructor(props: IAddOrEditPanelProps) {
        super(props);

        this.isNewMarker = this.props.markerItem.id.Equals(Guid.empty.toString());
        this.headerText = !this.isNewMarker ? "Bearbeiten" : "Neu";

    }
    
    public render(): React.ReactElement<IAddOrEditPanelProps> {

        const selectedCatId: string = this.state.markerCategories.Contains(cat => cat.id.Equals(this.state.markerItem.categoryId)) ? this.state.markerItem.categoryId : Guid.empty.toString();

        return (
            <Panel
              type={PanelType.medium}
              isOpen={true}
              onDismiss={() => { this.onConfigPanelDismiss() }}
              headerText={this.headerText}
              closeButtonAriaLabel="Close"
              onRenderFooterContent={(props: IPanelProps) => {
                return this.renderPanelFooter();
              }}
              // Stretch panel content to fill the available height so the footer is positioned
              // at the bottom of the page
              isFooterAtBottom={true}
            >
                <Label>
                    Category 
                    <span 
                        onClick={() => {
                            this.setState({
                                isManageCategoriesDialogVisible: true
                            });
                        }} 
                        className='manage-categories-label'>
                            (Manage)
                    </span>
                </Label> 
              <Dropdown
                placeholder="Select a category"
                defaultSelectedKey={selectedCatId}
                onChange={(ev: any, option: IDropdownOption) => {
                  this.state.markerItem.categoryId = option.key.toString();
                  this.setState({
                    markerItem: this.state.markerItem,
                    isSaveButtonDisabled: false
                  });
      
                }}
                options={this.categoryOptions}
              />
              <ChoiceGroup 
                label="Type of marker (on click)" 
                defaultSelectedKey={this.state.markerItem.type} 
                onChange={(ev: any, option: IChoiceGroupOption) => {
                  this.state.markerItem.type = option.key.toString() as MarkerType;

                //   if( this.state.markerItem.type == "None") {
                //     this.state.markerItem.markerClickProps = undefined;
                //   }
      
                  this.setState({
                    markerItem: this.state.markerItem,
                    isSaveButtonDisabled: false
                  });
                }}
                options={this.markerTypeOptions} />
      
                {this.renderNonCategorySettings()}      
                {this.renderUrlSettings()}
                {this.renderPanelOrDialogSettings()}
                {this.renderManageCategoriesDialog()}
            </Panel>
          );
    }

    private renderPanelFooter(): JSX.Element {
        return (<div>
            <PrimaryButton disabled={this.state.isSaveButtonDisabled} onClick={() => {

              if(this.isNewMarker) {
                  this.state.markerItem.id = Guid.newGuid().toString();
              }
              
              this.onSaveMarkerClick(this.state.markerItem);
            }}>
              Save
            </PrimaryButton>
            <DefaultButton onClick={() => { this.onConfigPanelDismiss(); }}>Cancel</DefaultButton>
          </div>);
    }

    private renderNonCategorySettings(): JSX.Element {

        if(this.state.markerCategories.Contains(cat => cat.id.Equals(this.state.markerItem.categoryId))) {
            return (<></>);
        }

        return (
            <>
                <InlineColorPicker 
                label='Marker Color' 
                alphaType='none'
                color={getColorFromString(this.state.markerItem.iconProperties.markerColor)} 
                onChange={(ev: any, color: IColor) => {
                    this.state.markerItem.iconProperties.markerColor = "#" + color.hex;
                    this.setState({
                    markerItem: this.state.markerItem,
                    isSaveButtonDisabled: false
                    });
                }} 
                />
    
                <TextField label='Icon' description='leaf blank for none' defaultValue={this.state.markerItem.iconProperties.iconName} onChange={(ev: any, iconName: string) => {
                    this.state.markerItem.iconProperties.iconName = iconName;
                    this.setState({
                    markerItem: this.state.markerItem,
                    isSaveButtonDisabled: false
                    });
                }} />

                <InlineColorPicker 
                    label='Icon Color' 
                    alphaType='none'
                    color={getColorFromString(this.state.markerItem.iconProperties.iconColor)} 
                    onChange={(ev: any, color: IColor) => {
                        this.state.markerItem.iconProperties.iconColor = "#" + color.hex;
                        this.setState({
                        markerItem: this.state.markerItem,
                        isSaveButtonDisabled: false
                        });
                    }}
                    isDisbaled={isNullOrEmpty(this.state.markerItem.iconProperties.iconName)}
                />
    
                <TextField label='Popup Text' description='leaf blank for none' defaultValue={this.state.markerItem.popuptext} onChange={(ev: any, popuptext: string) => {
                    this.state.markerItem.popuptext = popuptext;
                    this.setState({
                    markerItem: this.state.markerItem,
                    isSaveButtonDisabled: false
                    });
                }} />

                <Label>Vorschau</Label>
                <div style={{position: "relative", height: "36px", }}>
                    <div style={{position: "absolute"}}>
                        <MarkerIcon {...this.state.markerItem.iconProperties} />
                    </div>
                </div>
            </>
        );
    }

    private renderPanelOrDialogSettings(): JSX.Element {

        if(!(this.state.markerItem.type == "Dialog" || this.state.markerItem.type == "Panel")) {
            return (<></>);
        }

        return (<>
        <TextField label='Panel Header' defaultValue={this.state.markerItem.markerClickProps.content.headerText} onChange={(ev: any, headerText: string) => {
            this.state.markerItem.markerClickProps.content.headerText = headerText;
            this.setState({
              markerItem: this.state.markerItem,
              isSaveButtonDisabled: false
            });
          }} />

          <Label>Content</Label>
          <RichText isEditMode={true} value={this.state.markerItem.markerClickProps.content.html} onChange={(content: string): string => {
            this.state.markerItem.markerClickProps.content.html = content;
            this.setState({
              markerItem: this.state.markerItem,
              isSaveButtonDisabled: false
            });

            return content;
          }} />

        </>)
    }

    private renderUrlSettings(): JSX.Element {

        if(this.state.markerItem.type != "Url") {
            return (<></>);
        }

        return (
            <>
                <TextField label='Url' type='url' defaultValue={this.state.markerItem.markerClickProps.url.href} onChange={(ev: any, url: string) => {
                    this.state.markerItem.markerClickProps.url.href = url;
                    this.setState({
                    markerItem: this.state.markerItem,
                    isSaveButtonDisabled: false
                    });
                }} />

                <ChoiceGroup 
                    defaultSelectedKey={this.state.markerItem.markerClickProps.url.target} 
                    options={this.urlOptions} 
                    onChange={(ev: any, option: IChoiceGroupOption) => {
                        (this.state.markerItem.markerClickProps.url.target as any) = option.key;
                        
                        this.setState({
                            markerItem: this.state.markerItem,
                            isSaveButtonDisabled: false
                        });
                    }} 
                />
            </>
        );
    }

    private renderManageCategoriesDialog(): JSX.Element {

        if(!this.state.isManageCategoriesDialogVisible) {
            return (<></>);
        }

        return (
        <>
        <ManageMarkerCategoriesDialog 
            markerCategories={this.props.markerCategories} 
            onDismiss={() => {
                this.setState({
                    isManageCategoriesDialogVisible: false
                });
            }}
            onMarkerCategoriesChanged={(markerCategories: IMarkerCategory[]) => {
                
                this.setState({
                    isManageCategoriesDialogVisible: false,
                    markerCategories: markerCategories
                });

                if(isFunction(this.props.onMarkerCategoriesChanged)) {
                    this.props.onMarkerCategoriesChanged(markerCategories);
                }
            }}
        />
        </>
        );
    }

    private onConfigPanelDismiss(): void {
        if(isFunction(this.props.onDismiss)) {
            this.props.onDismiss();
        }
    }

    private onSaveMarkerClick(marker: IMarker): void {

        if(isFunction(this.props.onMarkerChanged)) {
            this.props.onMarkerChanged(this.state.markerItem, this.isNewMarker);
        }
    }

    private get categoryOptions(): IDropdownOption[] {
        const categories: IDropdownOption[] = [
            { key: Guid.empty.toString(), text: 'None' }
        ];

        this.state.markerCategories.forEach((category: IMarkerCategory) => {
            categories.push({ key: category.id, text: category.name });
        });

        return categories;
    }
}