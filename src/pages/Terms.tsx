import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Terms() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">Terms of Service</h1>
            <p className="text-gray-600">Last updated: November 2025</p>
          </div>

          {/* Terms Content */}
          <div className="space-y-6">
            {/* Section 1 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">1. Agreement to Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  By accessing and using Fleety, you accept and agree to be bound by the terms and provision of this agreement.
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">2. Use License</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  Permission is granted to temporarily download one copy of the materials (information or software) on Fleety for personal,
                  non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Modifying or copying the materials</li>
                  <li>Using the materials for any commercial purpose or for any public display</li>
                  <li>Attempting to decompile or reverse engineer any software contained on Fleety</li>
                  <li>Removing any copyright or other proprietary notations from the materials</li>
                  <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">3. Disclaimer</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  The materials on Fleety are provided "as is". Fleety makes no warranties, expressed or implied, and hereby disclaims
                  and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness
                  for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">4. Limitations</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  In no event shall Fleety or its suppliers be liable for any damages (including, without limitation, damages for loss of data
                  or profit, or due to business interruption) arising out of the use or inability to use the materials on Fleety, even if
                  Fleety or a Fleety authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">5. Accuracy of Materials</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  The materials appearing on Fleety could include technical, typographical, or photographic errors. Fleety does not warrant
                  that any of the materials on our website are accurate, complete or current. Fleety may make changes to the materials contained
                  on our website at any time without notice.
                </p>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">6. Links</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  Fleety has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site.
                  The inclusion of any link does not imply endorsement by Fleety of the site. Use of any such linked website is at the user's own risk.
                </p>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">7. Modifications</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  Fleety may revise these terms of service for our website at any time without notice. By using this website you are agreeing
                  to be bound by the then current version of these terms of service.
                </p>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">8. Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where Fleety operates,
                  and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </CardContent>
            </Card>

            {/* Section 9 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">9. User Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  You are responsible for maintaining the confidentiality of any account information and password. You agree to accept responsibility
                  for all activities that occur under your account. You must notify us immediately if you become aware of any unauthorized use of your account.
                </p>
              </CardContent>
            </Card>

            {/* Section 10 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">10. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="pt-2">
                  <strong>Email:</strong> support@Fleety.com<br />
                  <strong>Address:</strong> Remote Support Available 24/7
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
