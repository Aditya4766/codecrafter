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
    expectedTimeComplexity?: string;
    expectedSpaceComplexity?: string;
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
    line = sys.stdin.readline().strip()
    if not line: sys.exit(0)
    nums = list(map(int, line.split()))
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
        if(!sc.hasNextLine()) return;
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
    if(!std::getline(std::cin, line)) return 0;
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
        ],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)"
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
    if not line: sys.exit(0)
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
        ],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)"
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
    if(!(std::cin >> s)) return 0;
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

const input = fs.readFileSync(0, 'utf8').trim();
console.log(isValid(input));
`
        },
        functionSignature: 'isValid(s: str) -> bool',
        testCases: [
            { input: "()", expectedOutput: "true", hidden: false },
            { input: "()[]{}", expectedOutput: "true", hidden: false },
            { input: "(]", expectedOutput: "false", hidden: false },
            { input: "([)]", expectedOutput: "false", hidden: true },
            { input: "{[]}", expectedOutput: "true", hidden: true }
        ],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)"
    },
    {
        id: 'palindrome-number',
        title: 'Palindrome Number',
        difficulty: 'Easy',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a palindrome, and <code>false</code> otherwise.</p>
<p>An integer is a palindrome when it reads the same forward and backward. For example, <code>121</code> is a palindrome while <code>123</code> is not.</p>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> 121
<strong>Output:</strong> true</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>-2<sup>31</sup> <= x <= 2<sup>31</sup> - 1</code></li>
</ul>
        `,
        starterCode: {
            python: `import sys

class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Your code here
        pass

if __name__ == "__main__":
    line = sys.stdin.readline().strip()
    if not line: sys.exit(0)
    x = int(line)
    print(str(Solution().isPalindrome(x)).lower())
`,
            java: `import java.util.*;

class Solution {
    public boolean isPalindrome(int x) {
        // Your code here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(!sc.hasNextInt()) return;
        int x = sc.nextInt();
        System.out.println(new Solution().isPalindrome(x));
    }
}
`,
            cpp: `#include <iostream>

class Solution {
public:
    bool isPalindrome(int x) {
        // Your code here
        return false;
    }
};

int main() {
    int x;
    if(!(std::cin >> x)) return 0;
    Solution sol;
    std::cout << (sol.isPalindrome(x) ? "true" : "false") << std::endl;
    return 0;
}
`,
            javascript: `const fs = require('fs');

/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    // Your code here
};

const input = fs.readFileSync(0, 'utf8').trim();
if(!input) process.exit();
console.log(isPalindrome(parseInt(input)));
`
        },
        functionSignature: 'isPalindrome(x: int) -> bool',
        testCases: [
            { input: "121", expectedOutput: "true", hidden: false },
            { input: "-121", expectedOutput: "false", hidden: false },
            { input: "10", expectedOutput: "false", hidden: false },
            { input: "12321", expectedOutput: "true", hidden: true },
            { input: "0", expectedOutput: "true", hidden: true }
        ],
        expectedTimeComplexity: "O(log n)",
        expectedSpaceComplexity: "O(1)"
    },
    {
        id: 'remove-duplicates-from-sorted-array',
        title: 'Remove Duplicates from Sorted Array',
        difficulty: 'Medium',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>Given an integer array <code>nums</code> sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Then return the number of unique elements in <code>nums</code>.</p>
<p>Consider the number of unique elements of <code>nums</code> to be <code>k</code>. To get accepted, you need to do the following things:</p>
<ul class="list-disc pl-5">
  <li>Change the array <code>nums</code> such that the first <code>k</code> elements of <code>nums</code> contain the unique elements in the order they were initially in <code>nums</code>.</li>
  <li>Return <code>k</code>.</li>
</ul>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> 1 1 2
<strong>Output:</strong> 
2
1 2</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>1 <= nums.length <= 3 * 10<sup>4</sup></code></li>
  <li><code>-100 <= nums[i] <= 100</code></li>
  <li><code>nums</code> is sorted in non-decreasing order.</li>
</ul>
        `,
        starterCode: {
            python: `from typing import List
import sys

class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        # Your code here
        pass

if __name__ == "__main__":
    line = sys.stdin.readline().strip()
    if not line: sys.exit(0)
    nums = list(map(int, line.split()))
    k = Solution().removeDuplicates(nums)
    print(k)
    print(" ".join(map(str, nums[:k])))
`,
            java: `import java.util.*;

class Solution {
    public int removeDuplicates(int[] nums) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(!sc.hasNextLine()) return;
        String[] line = sc.nextLine().trim().split("\\\\s+");
        if(line[0].isEmpty()) return;
        int[] nums = new int[line.length];
        for(int i=0; i<line.length; i++) nums[i] = Integer.parseInt(line[i]);
        
        int k = new Solution().removeDuplicates(nums);
        System.out.println(k);
        for(int i=0; i<k; i++) {
            System.out.print(nums[i] + (i == k - 1 ? "" : " "));
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
    int removeDuplicates(std::vector<int>& nums) {
        // Your code here
        return 0;
    }
};

int main() {
    std::string line;
    if(!std::getline(std::cin, line)) return 0;
    std::stringstream ss(line);
    std::vector<int> nums;
    int n;
    while(ss >> n) nums.push_back(n);
    
    Solution sol;
    int k = sol.removeDuplicates(nums);
    std::cout << k << std::endl;
    for(int i=0; i<k; ++i) {
        std::cout << nums[i] << (i == k - 1 ? "" : " ");
    }
    std::cout << std::endl;
    return 0;
}
`,
            javascript: `const fs = require('fs');

/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function(nums) {
    // Your code here
};

const input = fs.readFileSync(0, 'utf8').trim();
if(!input) process.exit();
const nums = input.split(' ').map(Number);
const k = removeDuplicates(nums);
console.log(k);
console.log(nums.slice(0, k).join(' '));
`
        },
        functionSignature: 'removeDuplicates(nums: List[int]) -> int',
        testCases: [
            { input: "1 1 2", expectedOutput: "2\n1 2", hidden: false },
            { input: "0 0 1 1 1 2 2 3 3 4", expectedOutput: "5\n0 1 2 3 4", hidden: false },
            { input: "1 2 3", expectedOutput: "3\n1 2 3", hidden: true },
            { input: "1 1 1 1", expectedOutput: "1\n1", hidden: true }
        ],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)"
    },
    {
        id: 'best-time-to-buy-and-sell-stock',
        title: 'Best Time to Buy and Sell Stock',
        difficulty: 'Hard',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i<sup>th</sup></code> day.</p>
<p>You want to maximize your profit by choosing a <strong>single day</strong> to buy one stock and choosing a <strong>different day in the future</strong> to sell that stock.</p>
<p>Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.</p>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> 7 1 5 3 6 4
<strong>Output:</strong> 5
<strong>Explanation:</strong> Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>1 <= prices.length <= 10<sup>5</sup></code></li>
  <li><code>0 <= prices[i] <= 10<sup>4</sup></code></li>
</ul>
        `,
        starterCode: {
            python: `from typing import List
import sys

class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        # Your code here
        pass

if __name__ == "__main__":
    line = sys.stdin.readline().strip()
    if not line: sys.exit(0)
    prices = list(map(int, line.split()))
    print(Solution().maxProfit(prices))
`,
            java: `import java.util.*;

class Solution {
    public int maxProfit(int[] prices) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(!sc.hasNextLine()) return;
        String[] line = sc.nextLine().trim().split("\\\\s+");
        if(line[0].isEmpty()) return;
        int[] prices = new int[line.length];
        for(int i=0; i<line.length; i++) prices[i] = Integer.parseInt(line[i]);
        System.out.println(new Solution().maxProfit(prices));
    }
}
`,
            cpp: `#include <vector>
#include <iostream>
#include <string>
#include <sstream>
#include <algorithm>

class Solution {
public:
    int maxProfit(std::vector<int>& prices) {
        // Your code here
        return 0;
    }
};

int main() {
    std::string line;
    if(!std::getline(std::cin, line)) return 0;
    std::stringstream ss(line);
    std::vector<int> prices;
    int p;
    while(ss >> p) prices.push_back(p);
    
    Solution sol;
    std::cout << sol.maxProfit(prices) << std::endl;
    return 0;
}
`,
            javascript: `const fs = require('fs');

/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    // Your code here
};

const input = fs.readFileSync(0, 'utf8').trim();
if(!input) process.exit();
const prices = input.split(' ').map(Number);
console.log(maxProfit(prices));
`
        },
        functionSignature: 'maxProfit(prices: List[int]) -> int',
        testCases: [
            { input: "7 1 5 3 6 4", expectedOutput: "5", hidden: false },
            { input: "7 6 4 3 1", expectedOutput: "0", hidden: false },
            { input: "1 2", expectedOutput: "1", hidden: true },
            { input: "2 1", expectedOutput: "0", hidden: true },
            { input: "1 2 10 3 15", expectedOutput: "14", hidden: true }
        ],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)"
    },
    {
        id: 'move-zeroes',
        title: 'Move Zeroes',
        difficulty: 'Easy',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>Given an integer array <code>nums</code>, move all <code>0</code>'s to the end of it while maintaining the relative order of the non-zero elements.</p>
<p><strong>Note</strong> that you must do this in-place without making a copy of the array.</p>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> 0 1 0 3 12
<strong>Output:</strong> 1 3 12 0 0</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>1 <= nums.length <= 10<sup>4</sup></code></li>
  <li><code>-2<sup>31</sup> <= nums[i] <= 2<sup>31</sup> - 1</code></li>
</ul>
        `,
        starterCode: {
            python: `from typing import List
import sys

class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        # Your code here
        pass

if __name__ == "__main__":
    line = sys.stdin.readline().strip()
    if not line: sys.exit(0)
    nums = list(map(int, line.split()))
    Solution().moveZeroes(nums)
    print(" ".join(map(str, nums)))
`,
            java: `import java.util.*;

class Solution {
    public void moveZeroes(int[] nums) {
        // Your code here
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(!sc.hasNextLine()) return;
        String[] line = sc.nextLine().trim().split("\\\\s+");
        if(line[0].isEmpty()) return;
        int[] nums = new int[line.length];
        for(int i=0; i<line.length; i++) nums[i] = Integer.parseInt(line[i]);
        
        new Solution().moveZeroes(nums);
        for(int i=0; i<nums.length; i++) {
            System.out.print(nums[i] + (i == nums.length - 1 ? "" : " "));
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
    void moveZeroes(std::vector<int>& nums) {
        // Your code here
    }
};

int main() {
    std::string line;
    if(!std::getline(std::cin, line)) return 0;
    std::stringstream ss(line);
    std::vector<int> nums;
    int n;
    while(ss >> n) nums.push_back(n);
    
    Solution sol;
    sol.moveZeroes(nums);
    for(size_t i=0; i<nums.size(); ++i) {
        std::cout << nums[i] << (i == nums.size() - 1 ? "" : " ");
    }
    std::cout << std::endl;
    return 0;
}
`,
            javascript: `const fs = require('fs');

/**
 * @param {number[]} nums
 * @return {void}
 */
var moveZeroes = function(nums) {
    // Your code here
};

const input = fs.readFileSync(0, 'utf8').trim();
if(!input) process.exit();
const nums = input.split(' ').map(Number);
moveZeroes(nums);
console.log(nums.join(' '));
`
        },
        functionSignature: 'moveZeroes(nums: List[int]) -> None',
        testCases: [
            { input: "0 1 0 3 12", expectedOutput: "1 3 12 0 0", hidden: false },
            { input: "0", expectedOutput: "0", hidden: false },
            { input: "1 0", expectedOutput: "1 0", hidden: true },
            { input: "0 0 1", expectedOutput: "1 0 0", hidden: true },
            { input: "4 2 4 0 0 3 0 5 1 0", expectedOutput: "4 2 4 3 5 1 0 0 0 0", hidden: true }
        ],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)"
    },
    {
        id: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'Medium',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code>, and <code>false</code> otherwise.</p>
<p>An <strong>Anagram</strong> is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.</p>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> 
anagram
nagaram
<strong>Output:</strong> true</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>1 <= s.length, t.length <= 5 * 10<sup>4</sup></code></li>
  <li><code>s</code> and <code>t</code> consist of lowercase English letters.</li>
</ul>
        `,
        starterCode: {
            python: `import sys

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        # Your code here
        pass

if __name__ == "__main__":
    s = sys.stdin.readline().strip()
    t = sys.stdin.readline().strip()
    print(str(Solution().isAnagram(s, t)).lower())
`,
            java: `import java.util.*;

class Solution {
    public boolean isAnagram(String s, String t) {
        // Your code here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine().trim() : "";
        String t = sc.hasNextLine() ? sc.nextLine().trim() : "";
        System.out.println(new Solution().isAnagram(s, t));
    }
}
`,
            cpp: `#include <string>
#include <iostream>

class Solution {
public:
    bool isAnagram(std::string s, std::string t) {
        // Your code here
        return false;
    }
};

int main() {
    std::string s, t;
    if(!(std::cin >> s >> t)) return 0;
    Solution sol;
    std::cout << (sol.isAnagram(s, t) ? "true" : "false") << std::endl;
    return 0;
}
`,
            javascript: `const fs = require('fs');

/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function(s, t) {
    // Your code here
};

const input = fs.readFileSync(0, 'utf8').split('\\n');
const s = input[0] ? input[0].trim() : "";
const t = input[1] ? input[1].trim() : "";
console.log(isAnagram(s, t));
`
        },
        functionSignature: 'isAnagram(s: str, t: str) -> bool',
        testCases: [
            { input: "anagram\nnagaram", expectedOutput: "true", hidden: false },
            { input: "rat\ncar", expectedOutput: "false", hidden: false },
            { input: "a\na", expectedOutput: "true", hidden: true },
            { input: "ab\na", expectedOutput: "false", hidden: true },
            { input: "a\nab", expectedOutput: "false", hidden: true }
        ],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)"
    },
    {
        id: 'contains-duplicate',
        title: 'Contains Duplicate',
        difficulty: 'Easy',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>Given an integer array <code>nums</code>, return <code>true</code> if any value appears <strong>at least twice</strong> in the array, and return <code>false</code> if every element is distinct.</p>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> 1 2 3 1
<strong>Output:</strong> true</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>1 <= nums.length <= 10<sup>5</sup></code></li>
  <li><code>-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup></code></li>
</ul>
        `,
        starterCode: {
            python: `from typing import List
import sys

class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        # Your code here
        pass

if __name__ == "__main__":
    line = sys.stdin.readline().strip()
    if not line: sys.exit(0)
    nums = list(map(int, line.split()))
    print(str(Solution().containsDuplicate(nums)).lower())
`,
            java: `import java.util.*;

class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Your code here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(!sc.hasNextLine()) return;
        String[] line = sc.nextLine().trim().split("\\\\s+");
        if(line[0].isEmpty()) return;
        int[] nums = new int[line.length];
        for(int i=0; i<line.length; i++) nums[i] = Integer.parseInt(line[i]);
        System.out.println(new Solution().containsDuplicate(nums));
    }
}
`,
            cpp: `#include <vector>
#include <iostream>
#include <string>
#include <sstream>
#include <unordered_set>

class Solution {
public:
    bool containsDuplicate(std::vector<int>& nums) {
        // Your code here
        return false;
    }
};

int main() {
    std::string line;
    if(!std::getline(std::cin, line)) return 0;
    std::stringstream ss(line);
    std::vector<int> nums;
    int n;
    while(ss >> n) nums.push_back(n);
    
    Solution sol;
    std::cout << (sol.containsDuplicate(nums) ? "true" : "false") << std::endl;
    return 0;
}
`,
            javascript: `const fs = require('fs');

/**
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function(nums) {
    // Your code here
};

const input = fs.readFileSync(0, 'utf8').trim();
if(!input) process.exit();
const nums = input.split(' ').map(Number);
console.log(containsDuplicate(nums));
`
        },
        functionSignature: 'containsDuplicate(nums: List[int]) -> bool',
        testCases: [
            { input: "1 2 3 1", expectedOutput: "true", hidden: false },
            { input: "1 2 3 4", expectedOutput: "false", hidden: false },
            { input: "1 1 1 3 3 4 3 2 4 2", expectedOutput: "true", hidden: false },
            { input: "1", expectedOutput: "false", hidden: true },
            { input: "1 2 3 4 5 6 7 8 9 10", expectedOutput: "false", hidden: true }
        ],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(n)"
    },
    {
        id: 'missing-number',
        title: 'Missing Number',
        difficulty: 'Medium',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>Given an array <code>nums</code> containing <code>n</code> distinct numbers in the range <code>[0, n]</code>, return <em>the only number in the range that is missing from the array.</em></p>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> 3 0 1
<strong>Output:</strong> 2</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>n == nums.length</code></li>
  <li><code>1 <= n <= 10<sup>4</sup></code></li>
  <li><code>0 <= nums[i] <= n</code></li>
  <li>All the numbers of <code>nums</code> are <strong>unique</strong>.</li>
</ul>
        `,
        starterCode: {
            python: `from typing import List
import sys

class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        # Your code here
        pass

if __name__ == "__main__":
    line = sys.stdin.readline().strip()
    if not line: sys.exit(0)
    nums = list(map(int, line.split()))
    print(Solution().missingNumber(nums))
`,
            java: `import java.util.*;

class Solution {
    public int missingNumber(int[] nums) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(!sc.hasNextLine()) return;
        String[] line = sc.nextLine().trim().split("\\\\s+");
        if(line[0].isEmpty()) return;
        int[] nums = new int[line.length];
        for(int i=0; i<line.length; i++) nums[i] = Integer.parseInt(line[i]);
        System.out.println(new Solution().missingNumber(nums));
    }
}
`,
            cpp: `#include <vector>
#include <iostream>
#include <string>
#include <sstream>

class Solution {
public:
    int missingNumber(std::vector<int>& nums) {
        // Your code here
        return 0;
    }
};

int main() {
    std::string line;
    if(!std::getline(std::cin, line)) return 0;
    std::stringstream ss(line);
    std::vector<int> nums;
    int n;
    while(ss >> n) nums.push_back(n);
    
    Solution sol;
    std::cout << sol.missingNumber(nums) << std::endl;
    return 0;
}
`,
            javascript: `const fs = require('fs');

/**
 * @param {number[]} nums
 * @return {number}
 */
var missingNumber = function(nums) {
    // Your code here
};

const input = fs.readFileSync(0, 'utf8').trim();
if(!input) process.exit();
const nums = input.split(' ').map(Number);
console.log(missingNumber(nums));
`
        },
        functionSignature: 'missingNumber(nums: List[int]) -> int',
        testCases: [
            { input: "3 0 1", expectedOutput: "2", hidden: false },
            { input: "0 1", expectedOutput: "2", hidden: false },
            { input: "9 6 4 2 3 5 7 0 1", expectedOutput: "8", hidden: false },
            { input: "0", expectedOutput: "1", hidden: true },
            { input: "1 0", expectedOutput: "2", hidden: true }
        ],
        expectedTimeComplexity: "O(n)",
        expectedSpaceComplexity: "O(1)"
    },
    {
        id: 'merge-sorted-array',
        title: 'Merge Sorted Array',
        difficulty: 'Easy',
        description: `
<h3 class="font-semibold mt-4 mb-2">Problem Description</h3>
<p>You are given two integer arrays <code>nums1</code> and <code>nums2</code>, sorted in non-decreasing order, and two integers <code>m</code> and <code>n</code>, representing the number of elements in <code>nums1</code> and <code>nums2</code> respectively.</p>
<p><strong>Merge</strong> <code>nums1</code> and <code>nums2</code> into a single array sorted in non-decreasing order.</p>
<p>The final sorted array should not be returned by the function, but instead be <strong>stored inside the array</strong> <code>nums1</code>. To accommodate this, <code>nums1</code> has a length of <code>m + n</code>, where the first <code>m</code> elements denote the elements that should be merged, and the last <code>n</code> elements are set to <code>0</code> and should be ignored. <code>nums2</code> has a length of <code>n</code>.</p>

<h3 class="font-semibold mt-4 mb-2">Example 1:</h3>
<pre class="bg-muted p-2 rounded-md font-code text-sm"><strong>Input:</strong> 
1 2 3 0 0 0
3
2 5 6
3
<strong>Output:</strong> 1 2 2 3 5 6</pre>

<h3 class="font-semibold mt-4 mb-2">Constraints:</h3>
<ul class="list-disc pl-5 space-y-1">
  <li><code>nums1.length == m + n</code></li>
  <li><code>nums2.length == n</code></li>
  <li><code>0 <= m, n <= 200</code></li>
  <li><code>1 <= m + n <= 200</code></li>
  <li><code>-10<sup>9</sup> <= nums1[i], nums2[j] <= 10<sup>9</sup></code></li>
</ul>
        `,
        starterCode: {
            python: `from typing import List
import sys

class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        # Your code here
        pass

if __name__ == "__main__":
    line1 = sys.stdin.readline().strip()
    if not line1: sys.exit(0)
    nums1 = list(map(int, line1.split()))
    m = int(sys.stdin.readline())
    line2 = sys.stdin.readline().strip()
    nums2 = list(map(int, line2.split())) if line2 else []
    n = int(sys.stdin.readline())
    Solution().merge(nums1, m, nums2, n)
    print(" ".join(map(str, nums1)))
`,
            java: `import java.util.*;

class Solution {
    public void merge(int[] nums1, int m, int[] nums2, int n) {
        // Your code here
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(!sc.hasNextLine()) return;
        String[] line1 = sc.nextLine().trim().split("\\\\s+");
        int[] nums1 = new int[line1.length];
        for(int i=0; i<line1.length; i++) nums1[i] = Integer.parseInt(line1[i]);
        int m = sc.nextInt();
        sc.nextLine(); // consume newline
        
        String nextLine = sc.hasNextLine() ? sc.nextLine().trim() : "";
        int[] nums2;
        if(nextLine.isEmpty()) nums2 = new int[0];
        else {
            String[] line2 = nextLine.split("\\\\s+");
            nums2 = new int[line2.length];
            for(int i=0; i<line2.length; i++) nums2[i] = Integer.parseInt(line2[i]);
        }
        int n = sc.hasNextInt() ? sc.nextInt() : 0;
        
        new Solution().merge(nums1, m, nums2, n);
        for(int i=0; i<nums1.length; i++) {
            System.out.print(nums1[i] + (i == nums1.length - 1 ? "" : " "));
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
    void merge(std::vector<int>& nums1, int m, std::vector<int>& nums2, int n) {
        // Your code here
    }
};

int main() {
    std::string line1;
    if(!std::getline(std::cin, line1)) return 0;
    std::stringstream ss1(line1);
    std::vector<int> nums1;
    int p;
    while(ss1 >> p) nums1.push_back(p);
    int m; std::cin >> m;
    std::string line2;
    std::getline(std::cin, line2); // consume newline
    std::getline(std::cin, line2);
    std::stringstream ss2(line2);
    std::vector<int> nums2;
    while(ss2 >> p) nums2.push_back(p);
    int n; std::cin >> n;
    
    Solution sol;
    sol.merge(nums1, m, nums2, n);
    for(size_t i=0; i<nums1.size(); ++i) {
        std::cout << nums1[i] << (i == nums1.size() - 1 ? "" : " ");
    }
    std::cout << std::endl;
    return 0;
}
`,
            javascript: `const fs = require('fs');

/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void}
 */
var merge = function(nums1, m, nums2, n) {
    // Your code here
};

const input = fs.readFileSync(0, 'utf8').split('\\n');
const nums1 = input[0].trim().split(' ').map(Number);
const m = parseInt(input[1]);
const nums2 = input[2].trim() ? input[2].trim().split(' ').map(Number) : [];
const n = parseInt(input[3]);

merge(nums1, m, nums2, n);
console.log(nums1.join(' '));
`
        },
        functionSignature: 'merge(nums1: List[int], m: int, nums2: List[int], n: int) -> None',
        testCases: [
            { input: "1 2 3 0 0 0\n3\n2 5 6\n3", expectedOutput: "1 2 2 3 5 6", hidden: false },
            { input: "1\n1\n\n0", expectedOutput: "1", hidden: false },
            { input: "0\n0\n1\n1", expectedOutput: "1", hidden: false },
            { input: "4 5 6 0 0 0\n3\n1 2 3\n3", expectedOutput: "1 2 3 4 5 6", hidden: true },
            { input: "1 2 3 0 0 0 0\n3\n2 5 6 7\n4", expectedOutput: "1 2 2 3 5 6 7", hidden: true }
        ],
        expectedTimeComplexity: "O(n + m)",
        expectedSpaceComplexity: "O(1)"
    }
];
