// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import type {ChangeEvent, MouseEvent} from 'react';
import type {IntlShape, WrappedComponentProps} from 'react-intl';
import {FormattedMessage, defineMessage, injectIntl} from 'react-intl';
import type {RouteComponentProps} from 'react-router-dom';

import type {ServerError} from '@mattermost/types/errors';
import type {Team, TeamMembership} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';

import type {ActionResult} from 'mattermost-redux/types/actions';
import {isEmail} from 'mattermost-redux/utils/helpers';

import AdminUserCard from 'components/admin_console/admin_user_card/admin_user_card';
import BlockableLink from 'components/admin_console/blockable_link';
import ResetPasswordModal from 'components/admin_console/reset_password_modal';
import TeamList from 'components/admin_console/system_user_detail/team_list';
import ConfirmModal from 'components/confirm_modal';
import FormError from 'components/form_error';
import SaveButton from 'components/save_button';
import TeamSelectorModal from 'components/team_selector_modal';
import AdminHeader from 'components/widgets/admin_console/admin_header';
import AdminPanel from 'components/widgets/admin_console/admin_panel';
import AtIcon from 'components/widgets/icons/at_icon';
import EmailIcon from 'components/widgets/icons/email_icon';
import SheidOutlineIcon from 'components/widgets/icons/shield_outline_icon';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';

import {Constants, ModalIdentifiers} from 'utils/constants';
import {toTitleCase} from 'utils/utils';

import type {PropsFromRedux} from './index';

import './system_user_detail.scss';

// eslint-disable-next-line import/order
import {FaUserTie} from 'react-icons/fa';

export type Params = {
    user_id?: UserProfile['id'];
};

export type Props = PropsFromRedux & RouteComponentProps<Params> & WrappedComponentProps;

export type State = {
    user?: UserProfile;
    emailField: string;
    firstName: string;
    lastName: string;
    isLoading: boolean;
    error?: string | null;
    isSaveNeeded: boolean;
    isSaving: boolean;
    teams: TeamMembership[];
    teamIds: Array<Team['id']>;
    refreshTeams: boolean;
    showResetPasswordModal: boolean;
    showDeactivateMemberModal: boolean;
    showTeamSelectorModal: boolean;
    username: string;
    showProfileContent: boolean; // جديد
};

export class SystemUserDetail extends PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            emailField: '',
            firstName: '',
            lastName: '',
            username: '',
            isLoading: false,
            error: null,
            isSaveNeeded: false,
            isSaving: false,
            teams: [],
            teamIds: [],
            refreshTeams: true,
            showResetPasswordModal: false,
            showDeactivateMemberModal: false,
            showTeamSelectorModal: false,
            showProfileContent: false, // جديد
        };
    }

    getUser = async (userId: UserProfile['id']) => {
        this.setState({isLoading: true});

        try {
            const {data, error} = await this.props.getUser(userId) as ActionResult<UserProfile, ServerError>;
            if (data) {
                this.setState({
                    user: data,
                    emailField: data.email,
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    username: data.username || '',
                    isLoading: false,
                });
            } else {
                throw new Error(error ? error.message : 'Unknown error');
            }
        } catch (error) {
            console.log('SystemUserDetails-getUser: ', error); // eslint-disable-line no-console

            this.setState({
                isLoading: false,
                error: this.props.intl.formatMessage({id: 'admin.user_item.userNotFound', defaultMessage: 'Cannot load User'}),
            });
        }
    };

    componentDidMount() {
        const userId = this.props.match.params.user_id ?? '';
        if (userId) {
            this.getUser(userId);
        }
    }

    handleTeamsLoaded = (teams: TeamMembership[]) => {
        const teamIds = teams.map((team) => team.team_id);
        this.setState({teams, teamIds, refreshTeams: false});
    };

    handleAddUserToTeams = (teams: Team[]) => {
        if (!this.state.user) {
            return;
        }

        const promises = [];
        for (const team of teams) {
            promises.push(this.props.addUserToTeam(team.id, this.state.user.id));
        }
        Promise.all(promises).finally(() =>
            this.setState({refreshTeams: true}),
        );
    };

    handleActivateUser = async () => {
        if (!this.state.user) {
            return;
        }

        try {
            const {error} = await this.props.updateUserActive(this.state.user.id, true) as ActionResult<boolean, ServerError>;
            if (error) {
                throw new Error(error.message);
            }

            await this.getUser(this.state.user.id);
        } catch (err) {
            console.error('SystemUserDetails-handleActivateUser', err); // eslint-disable-line no-console

            this.setState({error: this.props.intl.formatMessage({id: 'admin.user_item.userActivateFailed', defaultMessage: 'Failed to activate user'})});
        }
    };

    handleDeactivateMember = async () => {
        if (!this.state.user) {
            return;
        }

        try {
            const {error} = await this.props.updateUserActive(this.state.user.id, false) as ActionResult<boolean, ServerError>;
            if (error) {
                throw new Error(error.message);
            }

            await this.getUser(this.state.user.id);
        } catch (err) {
            console.error('SystemUserDetails-handleDeactivateMember', err); // eslint-disable-line no-console

            this.setState({error: this.props.intl.formatMessage({id: 'admin.user_item.userDeactivateFailed', defaultMessage: 'Failed to deactivate user'})});
        }

        this.toggleCloseModalDeactivateMember();
    };

    handleRemoveMFA = async () => {
        if (!this.state.user) {
            return;
        }

        try {
            const {error} = await this.props.updateUserMfa(this.state.user.id, false) as ActionResult<boolean, ServerError>;
            if (error) {
                throw new Error(error.message);
            }

            await this.getUser(this.state.user.id);
        } catch (err) {
            console.error('SystemUserDetails-handleRemoveMFA', err); // eslint-disable-line no-console

            this.setState({error: this.props.intl.formatMessage({id: 'admin.user_item.userMFARemoveFailed', defaultMessage: 'Failed to remove user\'s MFA'})});
        }
    };

    handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!this.state.user) {
            return;
        }

        const {target: {value}} = event;

        const didEmailChanged = value !== this.state.user.email;
        this.setState({
            emailField: value,
            isSaveNeeded: didEmailChanged,
        });

        this.props.setNavigationBlocked(didEmailChanged);
    };

    handleFirstNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({firstName: event.target.value, isSaveNeeded: true});
    };

    handleLastNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({lastName: event.target.value, isSaveNeeded: true});
    };
    handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({username: event.target.value, isSaveNeeded: true});
    };
    handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (this.state.isLoading || this.state.isSaving || !this.state.user) {
            return;
        }

        if (!isEmail(this.state.emailField)) {
            this.setState({error: this.props.intl.formatMessage({id: 'admin.user_item.invalidEmail', defaultMessage: 'Invalid email address'})});
            return;
        }

        const updatedUser = {
            ...this.state.user,
            email: this.state.emailField.trim().toLowerCase(),
            first_name: this.state.firstName.trim(),
            last_name: this.state.lastName.trim(),
            username: this.state.username.trim(),
        };

        this.setState({
            error: null,
            isSaving: true,
        });

        try {
            const {data, error} = await this.props.patchUser(updatedUser) as ActionResult<UserProfile, ServerError>;
            if (data) {
                this.setState({
                    user: data,
                    emailField: data.email,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    username: data.username,
                    error: null,
                    isSaving: false,
                    isSaveNeeded: false,
                });
            } else {
                throw new Error(error ? error.message : 'Unknown error');
            }
        } catch (err) {
            console.error('SystemUserDetails-handleSubmit', err); // eslint-disable-line no-console

            this.setState({
                error: this.props.intl.formatMessage({id: 'admin.user_item.userUpdateFailed', defaultMessage: 'Failed to update user'}),
                isSaving: false,
                isSaveNeeded: false,
            });
        }

        this.props.setNavigationBlocked(false);
    };

    // جديد: إضافة دالة لتغيير حالة عرض/إخفاء المحتوى
    toggleProfileContent = () => {
        this.setState((prevState) => ({showProfileContent: !prevState.showProfileContent}));
    };

    // Modal close/open handlers
    toggleOpenModalDeactivateMember = () => {
        this.setState({showDeactivateMemberModal: true});
    };

    toggleCloseModalDeactivateMember = () => {
        this.setState({showDeactivateMemberModal: false});
    };

    toggleOpenModalResetPassword = () => {
        this.props.openModal({
            modalId: ModalIdentifiers.RESET_PASSWORD_MODAL,
            dialogType: ResetPasswordModal,
            dialogProps: {user: this.state.user},
        });
    };

    toggleCloseModalResetPassword = () => {
        this.setState({showResetPasswordModal: false});
    };

    toggleOpenTeamSelectorModal = () => {
        this.setState({showTeamSelectorModal: true});
    };

    toggleCloseTeamSelectorModal = () => {
        this.setState({showTeamSelectorModal: false});
    };

    render() {
        return (
            <div className='SystemUserDetail wrapper--fixed'>
                <AdminHeader withBackButton={true}>
                    <div>
                        <BlockableLink
                            to='/admin_console/user_management/users'
                            className='fa fa-angle-left back'
                        />
                        <FormattedMessage
                            id='admin.systemUserDetail.title'
                            defaultMessage='User Configuration'
                        />
                    </div>
                </AdminHeader>
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>

                        {/* User details */}
                        <AdminUserCard
                            user={this.state.user}
                            isLoading={this.state.isLoading}
                            body={
                                this.state.showProfileContent && (
                                    <>
                                        <span>{this.state?.user?.position ?? ''}</span>
                                        <label>
                                            <FormattedMessage
                                                id='admin.userManagement.userDetail.email'
                                                defaultMessage='Email'
                                            />
                                            <EmailIcon/>
                                            <input
                                                className='form-control'
                                                type='text'
                                                value={this.state.emailField}
                                                onChange={this.handleEmailChange}
                                                disabled={this.state.error !== null || this.state.isSaving}
                                            />
                                        </label>

                                        <label>
                                            <FormattedMessage
                                                id='user.settings.general.firstName'
                                                defaultMessage='First Name'
                                            />
                                            <span><FaUserTie className='FaUserTie'/></span>
                                            <input
                                                className='form-control'
                                                type='text'
                                                value={this.state.firstName}
                                                onChange={this.handleFirstNameChange}
                                            />
                                        </label>
                                        <label>
                                            <FormattedMessage
                                                id='user.settings.general.nicknamee'
                                                defaultMessage='Last Name'
                                            />
                                            <span><FaUserTie className='FaUserTie'/></span>
                                            <input
                                                className='form-control'
                                                type='text'
                                                value={this.state.lastName}
                                                onChange={this.handleLastNameChange}
                                            />
                                        </label>
                                        <label>
                                            <FormattedMessage
                                                id='user.settings.general.username'
                                                defaultMessage='Username'
                                            />
                                            <AtIcon/>
                                            <input
                                                className='form-control'
                                                type='text'
                                                value={this.state.username}
                                                onChange={this.handleUsernameChange}
                                            />

                                        </label>
                                        <label>
                                            <FormattedMessage
                                                id='admin.userManagement.userDetail.authenticationMethod'
                                                defaultMessage='Authentication Method'
                                            />
                                            <SheidOutlineIcon/>
                                            <span>{getUserAuthenticationTextField(this.props.intl, this.props.mfaEnabled, this.state.user)}</span>
                                        </label>
                                    </>
                                )
                            }

                            footer={
                                <>
                                    <button
                                        className='btn btn-secondary'
                                        onClick={this.toggleOpenModalResetPassword}
                                    >
                                        <FormattedMessage
                                            id='admin.user_item.resetPwd'
                                            defaultMessage='Reset Password'
                                        />
                                    </button>

                                    <button
                                        className='btn btn-secondary'
                                        onClick={this.toggleProfileContent}
                                    >
                                        <FormattedMessage
                                            id='user.settings.modal.profile'
                                            defaultMessage='Profile Settings'
                                        />
                                    </button>

                                    {this.state.user?.mfa_active && (
                                        <button
                                            className='btn btn-secondary'
                                            onClick={this.handleRemoveMFA}
                                        >
                                            <FormattedMessage
                                                id='admin.user_item.resetMfa'
                                                defaultMessage='Remove MFA'
                                            />
                                        </button>
                                    )}
                                    {this.state.user?.delete_at !== 0 && (
                                        <button
                                            className='btn btn-secondary'
                                            onClick={this.handleActivateUser}
                                        >
                                            <FormattedMessage
                                                id='admin.user_item.makeActive'
                                                defaultMessage='Activate'
                                            />
                                        </button>
                                    )}
                                    {this.state.user?.delete_at === 0 && (
                                        <button
                                            className='btn btn-secondary btn-danger'
                                            onClick={this.toggleOpenModalDeactivateMember}
                                        >
                                            <FormattedMessage
                                                id='admin.user_item.deactivate'
                                                defaultMessage='Deactivate'
                                            />
                                        </button>
                                    )}
                                </>
                            }
                        />

                        {/* User's team details */}
                        <AdminPanel
                            title={defineMessage({id: 'admin.userManagement.userDetail.teamsTitle', defaultMessage: 'Team Membership'})}
                            subtitle={defineMessage({id: 'admin.userManagement.userDetail.teamsSubtitle', defaultMessage: 'Teams to which this user belongs'})}
                            button={
                                <div className='add-team-button'>
                                    <button
                                        type='button'
                                        className='btn btn-primary'
                                        onClick={this.toggleOpenTeamSelectorModal}
                                        disabled={this.state.isLoading || this.state.error !== null}
                                    >
                                        <FormattedMessage
                                            id='admin.userManagement.userDetail.addTeam'
                                            defaultMessage='Add Team'
                                        />
                                    </button>
                                </div>
                            }
                        >
                            {this.state.isLoading && (
                                <div className='teamlistLoading'>
                                    <LoadingSpinner/>
                                </div>
                            )}
                            {!this.state.isLoading && this.state.user?.id && (
                                <TeamList
                                    userId={this.state.user.id}
                                    userDetailCallback={this.handleTeamsLoaded}
                                    refreshTeams={this.state.refreshTeams}
                                />
                            )}
                        </AdminPanel>
                    </div>
                </div>

                {/* Footer */}
                <div className='admin-console-save'>
                    <SaveButton
                        saving={this.state.isSaving}
                        disabled={!this.state.isSaveNeeded || this.state.isLoading || this.state.error !== null || this.state.isSaving}
                        onClick={this.handleSubmit}
                    />
                    <div className='error-message'>
                        <FormError error={this.state.error}/>
                    </div>
                </div>

                {/* Confirm Modal for Deactivation */}
                <ConfirmModal
                    show={this.state.showDeactivateMemberModal}
                    title={
                        <FormattedMessage
                            id='deactivate_member_modal.title'
                            defaultMessage='Deactivate {username}'
                            values={{
                                username: this.state.user?.username ?? '',
                            }}
                        />
                    }
                    message={
                        <div>
                            <FormattedMessage
                                id='deactivate_member_modal.desc'
                                defaultMessage='This action deactivates {username}. They will be logged out and not have access to any teams or channels on this system. Are you sure you want to deactivate {username}?'
                                values={{
                                    username: this.state.user?.username ?? '',
                                }}
                            />
                            {this.state.user?.auth_service !== '' && this.state.user?.auth_service !== Constants.EMAIL_SERVICE && (
                                <strong>
                                    <br/>
                                    <br/>
                                    <FormattedMessage
                                        id='deactivate_member_modal.sso_warning'
                                        defaultMessage='You must also deactivate this user in the SSO provider or they will be reactivated on next login or sync.'
                                    />
                                </strong>
                            )}
                        </div>
                    }
                    confirmButtonClass='btn btn-danger'
                    confirmButtonText={
                        <FormattedMessage
                            id='deactivate_member_modal.deactivate'
                            defaultMessage='Deactivate'
                        />
                    }
                    onConfirm={this.handleDeactivateMember}
                    onCancel={this.toggleCloseModalDeactivateMember}
                />

                {/* Team Selector Modal */}
                {this.state.showTeamSelectorModal && (
                    <TeamSelectorModal
                        onModalDismissed={this.toggleCloseTeamSelectorModal}
                        onTeamsSelected={this.handleAddUserToTeams}
                        alreadySelected={this.state.teamIds}
                        excludeGroupConstrained={true}
                    />
                )}
            </div>
        );
    }
}

export default injectIntl(SystemUserDetail);

export function getUserAuthenticationTextField(intl: IntlShape, mfaEnabled: Props['mfaEnabled'], user?: UserProfile): string {
    if (!user) {
        return '';
    }

    let authenticationTextField;

    if (user.auth_service) {
        let service;
        if (user.auth_service === Constants.LDAP_SERVICE || user.auth_service === Constants.SAML_SERVICE) {
            service = user.auth_service.toUpperCase();
        } else {
            service = toTitleCase(user.auth_service);
        }
        authenticationTextField = service;
    } else {
        authenticationTextField = intl.formatMessage({
            id: 'admin.userManagement.userDetail.email',
            defaultMessage: 'Email',
        });
    }

    if (mfaEnabled) {
        if (user.mfa_active) {
            authenticationTextField += ', ';
            authenticationTextField += intl.formatMessage({id: 'admin.userManagement.userDetail.mfa', defaultMessage: 'MFA'});
        }
    }

    return authenticationTextField;
}
