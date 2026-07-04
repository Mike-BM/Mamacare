const securityAlerts = [
  'Multiple failed logins from same IP',
  'Provider accessing records outside work hours',
  'Patient data exported in bulk',
  'Video room accessed without appointment',
  'Admin privilege escalation attempt'
];

/**
 * Nneka Guardian Service
 * Handles real-time security monitoring and alerting.
 */
export const securityService = {
  /**
   * Send alert to Slack/Email
   * @param {string} alert - The alert message
   * @param {'low' | 'high' | 'critical'} severity - Severity level
   */
  sendAlert: async (alert, severity = 'low') => {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    console.log(`[SECURITY ALERT] [${severity.toUpperCase()}] ${alert}`);
    
    if (!webhookUrl) {
      console.warn("Nneka Guardian: SLACK_WEBHOOK_URL not configured. Alert logged to console only.");
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: `*[${severity.toUpperCase()}] Nneka Guardian Alert* \n> ${alert}`,
          icon_emoji: severity === 'critical' ? ':fire:' : ':warning:'
        })
      });
    } catch (err) {
      console.error("Nneka Guardian: Failed to send Slack alert:", err.message);
    }
  },

  /**
   * Log a security event to the database
   */
  logSecurityEvent: async (userId, action, metadata = {}) => {
    // This would connect to your Supabase 'security_logs' table
    console.log(`[AUDIT LOG] User: ${userId} | Action: ${action} | Data:`, metadata);
    
    // Auto-escalate if certain patterns are detected
    if (action === 'PRIVILEGE_ESCALATION') {
      await securityService.sendAlert(`Privilege escalation attempt by User: ${userId}`, 'critical');
    }
    
    if (metadata.bulkExportCount > 100) {
      await securityService.sendAlert(`Bulk patient data export detected (${metadata.bulkExportCount} records)`, 'high');
    }
  }
};
