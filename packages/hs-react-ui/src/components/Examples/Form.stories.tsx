import React, { useState } from 'react';
import styled from 'styled-components';
import { storiesOf } from '@storybook/react';
import { mdiAccountCircleOutline } from '@mdi/js';
import { name, address, internet, company, phone, commerce, lorem } from 'faker';
import TextInput from '../TextInput';
import Button from '../Button';
import Card from '../Card';
import Checkbox from '../Checkbox';
import Divider from '../Divider';
import Dropdown from '../Dropdown';
import Modal from '../Modal';
import Text from '../Text';
import Label from '../Label';
import Table from '../Table';
import colors from '../../enums/colors';

const design = {
  type: 'figma',
  url: 'https://www.figma.com/file/3r2G00brulOwr9j7F6JF59/Generic-UI-Style?node-id=0%3A1',
};

const stateAbbreviations = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL',
  'GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
  'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI',
  'SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
 ];

 interface state {
  firstName?: string;
  lastName?: string;
  title?: string;
  city?: string;
  streetAddress?: string;
  state?: string;
  phone?: string;
  email?: string;
  company?: string;
  department?: string;
  notifications?: boolean;
  bio?: string;
  age?: string; // TODO should be number, but input typing breaks it
 }

const defaultState: state = {
  firstName: name.firstName(),
  lastName: name.lastName(),
  title: name.title(),
  city: address.city(),
  streetAddress: address.streetAddress(),
  state: address.stateAbbr(),
  phone: phone.phoneNumber(),
  age: Math.ceil(Math.random() * 50 + 18) + '',
  email: internet.email(),
  company: company.companyName(),
  department: commerce.department(),
  notifications: false,
  bio: lorem.paragraph(5),
};

const StyledFooter = styled(Card.Footer)`
  display: flex;
  justify-items: flex-end;
`;

const StyledBody = styled(Card.Body)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 0.5rem;
  row-gap: 0.5rem;
`;

const StyledAgeInputContainer = styled(TextInput.Container)`
  width: 5rem;
  min-width: 0;
`;

const StyledInput = styled(TextInput.Input)`
  min-width: 0px;
  flex-grow: 1;
`;

const ResetButtonContainer = styled(Button.Container)`
  margin-right: 1.5rem;
`;

storiesOf('Form Example', module).add(
  'Controlled Form',
  () => {
    const [state, setState] = useState(defaultState);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [savedState, setSavedState] = useState(defaultState);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // This is not the best way to handle this, but will work for the current example
    // By creating a callback function like this, we will create a new callback for each
    // handler on every render, which is not the ideal scenario. To prevent this,
    // use the useCallback helper.
    const createTextInputCallback = (property: string): (event: any) => void => {
      return (event) => {
        setState(Object.assign({}, state, {[property]: event.target.value}));
      }
    }

    const onSave = () => {
      const newSavedState = Object.assign({}, state);
      setIsSaving(true);
      setTimeout(() => {
        setSavedState(newSavedState);
        setIsSaving(false);
      }, Math.random() * 500);
    }

    const onReset = () => {
      setIsResetting(true);
      setTimeout(() => {
        setIsResetting(false);
        setState(Object.assign({}, savedState));
      }, Math.random() * 750);
    }

    const closeModal = () => {
      setIsModalOpen(false);
    }

    const openModal = () => {
      setIsModalOpen(true);
    }

    const saveButton = (
      <Button
        key={"saveButton"}
        onClick={onSave}
        type={Button.ButtonTypes.outline}
        isProcessing={isSaving}
      >
        Save
      </Button>
    );

    const cancelButton = (
      <Button
        key={"cancelButton"}
        onClick={openModal}
        color={colors.grayXlight}
        isProcessing={isResetting}
        StyledContainer={ResetButtonContainer}
      >
        Reset
      </Button>
    );

    const confirmButton = (
      <Button
        key={"confirmButton"}
        onClick={onReset}
        type={Button.ButtonTypes.outline}
        color={colors.success}
      >
        Confirm
      </Button>
    );

    const abortButton = (
      <Button
        key={"cancelButton"}
        onClick={closeModal}
        color={colors.destructive}
        StyledContainer={ResetButtonContainer}
      >
        Abort
      </Button>
    );

    const Header = (
      <>
        <Text key="headerText" iconPrefix={mdiAccountCircleOutline}>
          {`${state.firstName || ''}'s Profile`}
        </Text>
        <Divider width="100%" />
      </>
    );

    const actionButtons = [];
    actionButtons.push()
    return (
      <>
        <Card
          header={Header}
          footer={[cancelButton, saveButton]}
          StyledFooter={StyledFooter}
          StyledBody={StyledBody}
        >
          <Label
            labelText="First Name"
            htmlFor="firstName"
            isRequired
            isValid={typeof state.firstName !== 'undefined' && state.firstName.length > 0}
            key="firstName"
          >
            <TextInput
              onChange={createTextInputCallback("firstName")}
              value={state.firstName}
              isValid={typeof state.firstName !== 'undefined' && state.firstName.length > 0}
              errorMessage="First Name cannot be blank"
              id="firstName"
              Input={StyledInput}
            />
          </Label>

          <Label
            labelText="Last Name"
            htmlFor="lastName"
            isRequired
            isValid={typeof state.lastName !== 'undefined' && state.lastName.length > 0}
            key="lastName"
          >
            <TextInput
              onChange={createTextInputCallback("lastName")}
              value={state.lastName}
              isValid={typeof state.lastName !== 'undefined' && state.lastName.length > 0}
              errorMessage="Last Name cannot be blank"
              id="lastName"
              Input={StyledInput}
            />
          </Label>

          <Label
            labelText="Age"
            htmlFor="age"
            key="age"
          >
            <TextInput
              onChange={createTextInputCallback("age")}
              value={state.age}
              errorMessage="Invalid Age"
              id="age"
              type="number"
              StyledContainer={StyledAgeInputContainer}
              Input={StyledInput}
            />
          </Label>

          <Label
            labelText="Title"
            htmlFor="title"
            isRequired
            isValid={typeof state.title !== 'undefined' && state.title.length > 0}
            key="title"
          >
            <TextInput
              onChange={createTextInputCallback("title")}
              value={state.title}
              isValid={typeof state.title !== 'undefined' && state.title.length > 0}
              errorMessage="Title cannot be blank"
              id="title"
              Input={StyledInput}
            />
          </Label>

          <Label
            labelText="Company"
            htmlFor="company"
            isValid={typeof state.company !== 'undefined' && state.company.length > 0}
            key="company"
          >
            <TextInput
              onChange={createTextInputCallback("company")}
              value={state.company}
              id="company"
              Input={StyledInput}
            />
          </Label>

          <Label
            labelText="Street Address"
            htmlFor="streetAddress"
            isRequired
            isValid={typeof state.streetAddress !== 'undefined' && state.streetAddress.length > 0}
            key="streetAddress"
          >
            <TextInput
              onChange={createTextInputCallback("streetAddress")}
              value={state.streetAddress}
              isValid={typeof state.streetAddress !== 'undefined' && state.streetAddress.length > 0}
              errorMessage="Street Address cannot be blank"
              id="streetAddress"
              Input={StyledInput}
            />
          </Label>

          <Label
            labelText="State"
            htmlFor="state"
            isRequired
            isValid={typeof state.state !== 'undefined'}
            key="state"
          >
            <Dropdown
              name="state-dropdown"
              options={stateAbbreviations}
              color={colors.grayXlight}
              values={[state.state as string]}
              onSelect={(val) => { setState(Object.assign({}, { state: val as string })) }}
            />
          </Label>

          <Label
            labelText="Bio"
            htmlFor="bio"
            key="bio"
          >
            <TextInput
              onChange={createTextInputCallback("bio")}
              value={state.bio}
              id="bio"
              isMultiline
              rows={5}
              cols={25}
            />
          </Label>

          <Label
            labelText="Enable Notifications"
            htmlFor="notifications"
            key="notifications"
          >
            <Checkbox
              onClick={() => {setState(Object.assign({}, state, { notifications: !state.notifications}))}}
              checked={state.notifications}
              checkboxType={Checkbox.Types.check}
            />
          </Label>
        </Card>
        {isModalOpen && <Modal
          header={"Would you like to continue?"}
          body={<Text>You will lose any unsaved changes, are you sure you would like to reset?</Text>}
          footer={[abortButton, confirmButton]}
          onClose={closeModal}
          onClickOutside={closeModal}

        />}
      </>
    );
  },
  { design },
);
