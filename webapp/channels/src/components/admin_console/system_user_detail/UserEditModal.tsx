// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

export type UserEditModalProps = {
    show: boolean;
    onHide: () => void;
    onSave: (firstName: string, lastName: string, email: string) => void;
    firstName: string;
    lastName: string;
    email: string;
};

const UserEditModal = ({show, onHide, onSave, firstName, lastName, email}: UserEditModalProps) => {
    const [newFirstName, setNewFirstName] = React.useState(firstName);
    const [newLastName, setNewLastName] = React.useState(lastName);
    const [newEmail, setNewEmail] = React.useState(email);

    const handleSubmit = () => {
        onSave(newFirstName, newLastName, newEmail);
        onHide();
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
        >
            <Modal.Header closeButton={true}>
                <Modal.Title>
                    <FormattedMessage
                        id='admin.userManagement.editUser'
                        defaultMessage='Edit User Information'
                    />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='form-group'>
                    <label>
                        <FormattedMessage
                            id='admin.userManagement.userDetail.firstName'
                            defaultMessage='First Name'
                        />
                        <input
                            type='text'
                            className='form-control'
                            value={newFirstName}
                            onChange={(e) => setNewFirstName(e.target.value)}
                        />
                    </label>
                    <label>
                        <FormattedMessage
                            id='admin.userManagement.userDetail.lastName'
                            defaultMessage='Last Name'
                        />
                        <input
                            type='text'
                            className='form-control'
                            value={newLastName}
                            onChange={(e) => setNewLastName(e.target.value)}
                        />
                    </label>
                    <label>
                        <FormattedMessage
                            id='admin.userManagement.userDetail.email'
                            defaultMessage='Email'
                        />
                        <input
                            type='email'
                            className='form-control'
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                    </label>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button
                    className='btn btn-secondary'
                    onClick={onHide}
                >
                    <FormattedMessage
                        id='admin.userManagement.cancel'
                        defaultMessage='Cancel'
                    />
                </button>
                <button
                    className='btn btn-primary'
                    onClick={handleSubmit}
                >
                    <FormattedMessage
                        id='admin.userManagement.save'
                        defaultMessage='Save'
                    />
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserEditModal;
