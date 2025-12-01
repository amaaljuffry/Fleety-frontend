import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Privacy() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: November 2025</p>
          </div>

          {/* Privacy Content */}
          <div className="space-y-6">
            {/* Section 1 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  Fleety ("we", "us", "our", or "Company") operates the Fleety website. This page informs you of our policies regarding
                  the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">2. Information Collection and Use</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p className="font-semibold">We collect several different types of information for various purposes:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Personal Data:</strong> Name, email address, phone number, vehicle information, maintenance records</li>
                  <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, time and date of visit</li>
                  <li><strong>Vehicle Data:</strong> Vehicle make, model, year, maintenance history, fuel efficiency data</li>
                  <li><strong>Cookies and Tracking:</strong> We use cookies and similar tracking technologies to track activity on our Service</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">3. Use of Data</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>Fleety uses the collected data for various purposes:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>To provide and maintain our Service</li>
                  <li>To notify you about changes to our Service</li>
                  <li>To allow you to participate in interactive features of our Service</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information to improve our Service</li>
                  <li>To monitor the usage of our Service</li>
                  <li>To detect, prevent and address technical issues and fraudulent activity</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">4. Security of Data</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  The security of your data is important to us but remember that no method of transmission over the Internet or method of
                  electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data,
                  we cannot guarantee its absolute security.
                </p>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">5. Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy
                  on this page and updating the "Last updated" date at the top of this Privacy Policy.
                </p>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">6. User Rights</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Access the personal data we hold about you</li>
                  <li>Correct any inaccurate personal data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Restrict or object to the processing of your personal data</li>
                  <li>Request portability of your personal data</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">7. Cookies</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  We use cookies to collect information and to improve our Service. You have the option to refuse our cookies, but please note
                  that doing so may affect your ability to use certain portions of our Service.
                </p>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">8. Third-Party Links</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be
                  directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
                </p>
              </CardContent>
            </Card>

            {/* Section 9 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">9. Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-3">
                <p>
                  Fleety will retain your personal data only for as long as necessary for the purposes set out in this Privacy Policy.
                  We will retain and use your personal data to the extent necessary to comply with our legal obligations.
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
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="pt-2">
                  <strong>Email:</strong> privacy@Fleety.com<br />
                  <strong>Support Email:</strong> support@Fleety.com<br />
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
