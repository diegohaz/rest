export default {
  <%_ if (typeof sendgridKey !== 'undefined' && sendgridKey) { _%>
  SENDGRID_KEY: '<%= sendgridKey %>'
  <%_ } _%>
}
