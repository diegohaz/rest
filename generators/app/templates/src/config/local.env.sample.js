export default {
  <%_ if (typeof sendgridKey !== 'undefined' && sendgridKey) { _%>
  SENDGRID_KEY: 'sendgridkey'
  <%_ } _%>
}
