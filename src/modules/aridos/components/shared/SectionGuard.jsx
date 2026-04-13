
import React from 'react';
import AccessDeniedState from './AccessDeniedState';
import { ARIDOS_ACTIONS, canAccessSection } from '../../utils/permissions';

export default function SectionGuard({ permissions, section, action = ARIDOS_ACTIONS.READ, fallback, children }) {
  if (canAccessSection(permissions, section, action)) return children;
  return fallback || <AccessDeniedState />;
}
