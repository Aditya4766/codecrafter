export type TestCase = {
    input: string;
    expectedOutput: string;
    hidden: boolean;
};

export type Problem = {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string;
    starterCode: {
        python: string;
        java: string;
        cpp: string;
        javascript: string;
    };
    functionSignature: string;
    testCases: TestCase[];
};

export const problems: Problem[] = [
    {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
<p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the <em>same</em> element twice.</p>
<p>Input Format: Two lines. The first line contains the space-separated integers of <code>nums</code>. The second line contains the <code>target</code> integer.</p>
<p>Output Format: The indices as space-separated integers.</p>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> 
2 7 11 15
9
<strong>Output:</strong> 0 1</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>2 <= nums.length <= 10<sup>4</sup></code></li>
  <li><code>-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup></code></li>
  <li><code>-10<sup>9</sup> <= target <= 10<sup>9</sup></code></li>
</ul>
        `,
        starterCode: {
            python: `from typing import List
import sys

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your code here
        pass

if __name__ == "__main__":
    nums = list(map(int, sys.stdin.readline().split()))
    target = int(sys.stdin.readline())
    res = Solution().twoSum(nums, target)
    print(" ".join(map(str, sorted(res))))
`,
            java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] line = sc.nextLine().split(" ");
        int[] nums = new int[line.length];
        for(int i=0; i<line.length; i++) nums[i] = Integer.parseInt(line[i]);
        int target = sc.nextInt();
        
        int[] res = new Solution().twoSum(nums, target);
        Arrays.sort(res);
        System.out.println(res[0] + " " + res[1]);
    }
}
`,
            cpp: `#include <vector>
#include <iostream>
#include <sstream>
#include <algorithm>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};

int main() {
    std::string line;
    std::getline(std::cin, line);
    std::stringstream ss(line);
    std::vector<int> nums;
    int n;
    while(ss >> n) nums.push_back(n);
    int target;
    std::cin >> target;
    
    Solution sol;
    std::vector<int> res = sol.twoSum(nums, target);
    std::sort(res.begin(), res.end());
    std::cout << res[0] << " " << res[1] << std::endl;
    return 0;
}
`,
            javascript: `const fs = require('fs');

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
};

const input = fs.readFileSync(0, 'utf8').split('\\n');
const nums = input[0].trim().split(' ').map(Number);
const target = parseInt(input[1]);
const res = twoSum(nums, target);
console.log(res.sort((a,b) => a-b).join(' '));
`
        },
        functionSignature: 'twoSum(nums: List[int], target: int) -> List[int]',
        testCases: [
            { input: "2 7 11 15\n9", expectedOutput: "0 1", hidden: false },
            { input: "3 2 4\n6", expectedOutput: "1 2", hidden: false },
            { input: "3 3\n6", expectedOutput: "0 1", hidden: true },
            { input: "1 5 8 10\n18", expectedOutput: "2 3", hidden: true }
        ]
    },
    {
        id: 'reverse-string',
        title: 'Reverse String',
        difficulty: 'Easy',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>Write a function that reverses a string. The input is a single line of space-separated characters.</p>
<p>You must do this by modifying the input array <strong>in-place</strong> with O(1) extra memory.</p>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> h e l l o
<strong>Output:</strong> o l l e h</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>1 <= s.length <= 10<sup>5</sup></code></li>
</ul>
        `,
        starterCode: {
            python: `from typing import List
import sys

class Solution:
    def reverseString(self, s: List[str]) -> None:
        # Your code here
        pass

if __name__ == "__main__":
    line = sys.stdin.readline().strip()
    if not line:
        print("")
        sys.exit()
    s = line.split()
    Solution().reverseString(s)
    print(" ".join(s))
`,
            java: `import java.util.*;

class Solution {
    public void reverseString(char[] s) {
        // Your code here
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();
        if(line.isEmpty()) return;
        String[] parts = line.split(" ");
        char[] s = new char[parts.length];
        for(int i=0; i<parts.length; i++) s[i] = parts[i].charAt(0);
        
        new Solution().reverseString(s);
        for(int i=0; i<s.length; i++) {
            System.out.print(s[i] + (i == s.length - 1 ? "" : " "));
        }
        System.out.println();
    }
}
`,
            cpp: `#include <vector>
#include <iostream>
#include <string>
#include <sstream>

class Solution {
public:
    void reverseString(std::vector<char>& s) {
        // Your code here
    }
};

int main() {
    std::string line;
    if(!std::getline(std::cin, line)) return 0;
    std::stringstream ss(line);
    std::vector<char> s;
    char c;
    while(ss >> c) s.push_back(c);
    
    Solution sol;
    sol.reverseString(s);
    for(size_t i=0; i<s.size(); ++i) {
        std::cout << s[i] << (i == s.size() - 1 ? "" : " ");
    }
    std::cout << std::endl;
    return 0;
}
`,
            javascript: `const fs = require('fs');

/**
 * @param {character[]} s
 * @return {void}
 */
var reverseString = function(s) {
    // Your code here
};

const input = fs.readFileSync(0, 'utf8').trim();
if(!input) process.exit();
const s = input.split(' ');
reverseString(s);
console.log(s.join(' '));
`
        },
        functionSignature: 'reverseString(s: List[str]) -> None',
        testCases: [
            { input: "h e l l o", expectedOutput: "o l l e h", hidden: false },
            { input: "H a n n a h", expectedOutput: "h a n n a H", hidden: false },
            { input: "a b c d", expectedOutput: "d c b a", hidden: true },
            { input: "z", expectedOutput: "z", hidden: true }
        ]
    },
    {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Medium',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> ()[]{}
<strong>Output:</strong> true</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>1 <= s.length <= 10<sup>4</sup></code></li>
</ul>
        `,
        starterCode: {
            python: `import sys

class Solution:
    def isValid(self, s: str) -> bool:
        # Your code here
        pass

if __name__ == "__main__":
    s = sys.stdin.readline().strip()
    print(str(Solution().isValid(s)).lower())
`,
            java: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        // Your code here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(!sc.hasNextLine()) return;
        String s = sc.nextLine().trim();
        System.out.println(new Solution().isValid(s));
    }
}
`,
            cpp: `#include <string>
#include <iostream>

class Solution {
public:
    bool isValid(std::string s) {
        // Your code here
        return false;
    }
};

int main() {
    std::string s;
    std::cin >> s;
    Solution sol;
    std::cout << (sol.isValid(s) ? "true" : "false") << std::endl;
    return 0;
}
`,
            javascript: `const fs = require('fs');

/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Your code here
};

const s = fs.readFileSync(0, 'utf8').trim();
console.log(isValid(s));
`
        },
        functionSignature: 'isValid(s: str) -> bool',
        testCases: [
            { input: "()", expectedOutput: "true", hidden: false },
            { input: "()[]{}", expectedOutput: "true", hidden: false },
            { input: "(]", expectedOutput: "false", hidden: false },
            { input: "([)]", expectedOutput: "false", hidden: true },
            { input: "{[]}", expectedOutput: "true", hidden: true }
        ]
    }
];
