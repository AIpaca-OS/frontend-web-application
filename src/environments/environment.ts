/**
 * Rumbo platform endpoints (Spring Boot published on Render).
 * Every bounded context composes its URLs from platformProviderApiBaseUrl plus a resource path.
 */
export const environment = {
  production: true,
  platformProviderApiBaseUrl: 'https://web-services-gjgh.onrender.com/api/v1',
  platformProviderProfilesEndpointPath: '/profiles',
  platformProviderStudentsEndpointPath: '/students',
  platformProviderServiceEnrollmentsEndpointPath: '/service-enrollments',
  platformProviderDataDeletionRequestsEndpointPath: '/data-deletion-requests',
  platformProviderRoutesEndpointPath: '/routes',
  platformProviderTripsEndpointPath: '/trips',
  platformProviderVehiclesEndpointPath: '/vehicles',
  platformProviderPlansEndpointPath: '/plans',
  platformProviderSubscriptionsEndpointPath: '/subscriptions',
  platformProviderIncidentsEndpointPath: '/incidents',
  platformProviderDelaysEndpointPath: '/delays',
  platformProviderNotificationsEndpointPath: '/notifications',
  platformProviderStudentJourneyNotificationsEndpointPath: '/notifications/student-journeys'
};
